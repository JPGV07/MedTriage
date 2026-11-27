/* =====================================================================
   MedTriage — Painel do Médico: Lista de chamada

   Funcionalidade:
     - Carrega consultas do médico logado
     - Filtra as de HOJE (ou próximas, se hoje estiver vazio)
     - Renderiza uma "lista de chamada" com ações por paciente:
         ▸ "Iniciar atendimento"  → atendimento.html?id=X
         ▸ "Marcar falta"         → confirma, salva, re-renderiza
     - Faltas são persistidas em localStorage + best-effort no backend

   Endpoints:
     GET /consultas             (best-effort)
     GET /consulta              (fallback)
     GET /users                 (documentado)
     GET /users/find?cpf=X      (documentado — header)
     PUT /consultas             (best-effort — status=CANCELADA)
     DELETE /consultas/{id}     (best-effort — 2ª tentativa)
   ===================================================================== */

const API_BASE = 'https://triagemapi-production.up.railway.app';
const PAGINA_LOGIN = '../index.html';
const PAGINA_ATENDIMENTO = 'atendimento.html'; // ← ajuste se necessário
const STORAGE_FALTAS = '@medtriage/faltas';

let consultasMedico = [];
let faltasLocais = lerFaltasLocais();

/* =====================================================================
   BOOT
   ===================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const matricula = String(
    localStorage.getItem('userMatricula') ||
    localStorage.getItem('userDocument') || ''
  ).toUpperCase();

  if (!token) { window.location.href = PAGINA_LOGIN; return; }

  // Logout real
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    ['token', 'userCpf', 'userName', 'userRole',
     'userMatricula', 'userDocument'].forEach((k) => localStorage.removeItem(k));
    window.location.href = PAGINA_LOGIN;
  });

  // Header (configName.js já preenche; fallback aqui)
  preencherNomeFallback();

  // Carrega consultas e renderiza
  await carregarDados(token, matricula);
});

/* =====================================================================
   NOME NO HEADER (fallback caso configName.js falhe)
   ===================================================================== */
function preencherNomeFallback() {
  const cached = localStorage.getItem('userName');
  if (!cached) return;
  const primeiro = cached.split(' ')[0];
  const g = document.getElementById('user-greeting');
  const t = document.getElementById('welcome-title');
  if (g) g.textContent = `Olá, Dr(a). ${primeiro}`;
  if (t) t.textContent = `Olá, Dr(a). ${cached.split(' ').slice(0, 2).join(' ')}`;
}

/* =====================================================================
   CARREGAR DADOS
   ===================================================================== */
async function carregarDados(token, matricula) {
  const lista = document.getElementById('lista-chamada');
  if (lista) {
    lista.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:32px 0;">Carregando consultas…</p>';
  }

  const [consultas, users] = await Promise.all([
    fetchLista('/consultas', '/consulta', token),
    fetchLista('/users', null, token)
  ]);

  if (!consultas) {
    mostrarVazio(
      'Não foi possível carregar',
      'Verifique sua conexão e tente novamente.'
    );
    return;
  }

  // Filtra pelo médico logado
  consultasMedico = filtrarPorMedico(consultas, matricula);

  // Stats
  atualizarStats(consultasMedico, users || []);

  // Renderiza chamada
  renderChamada(consultasMedico);
}

function fetchLista(path1, path2, token) {
  const paths = path2 ? [path1, path2] : [path1];
  for (const path of paths) {
    try {
      const resp = await fetch(`${API_BASE}${path}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn(`[dashboard] ${path} falhou:`, err);
    }
  }
  return null;
}

function filtrarPorMedico(consultas, matricula) {
  if (!matricula) return consultas;

  const identificavel = consultas.some((c) => {
    const doc = c.medico?.funcionario?.matricula
             || c.medico?.matricula
             || c.medico?.crm;
    return doc && String(doc).toUpperCase() === matricula;
  });

  if (!identificavel && consultas.length > 0) {
    console.warn('[dashboard] Filtro por médico falhou — mostrando todas.');
    return consultas;
  }

  return consultas.filter((c) => {
    const doc = c.medico?.funcionario?.matricula
             || c.medico?.matricula
             || c.medico?.crm;
    return String(doc || '').toUpperCase() === matricula;
  });
}

/* =====================================================================
   STATS
   ===================================================================== */
function atualizarStats(consultas, users) {
  const agora = Date.now();

  const futuras = consultas.filter((c) => {
    const d = parseData(c);
    return d && d.getTime() >= agora;
  });
  const passadas = consultas.filter((c) => {
    const d = parseData(c);
    return d && d.getTime() < agora;
  });

  const pacientesUnicos = new Set(
    consultas.map((c) => {
      const p = c.paciente;
      if (!p) return null;
      return p.usuario?.cpf || p.cpf || p.id;
    }).filter(Boolean)
  ).size;

  setTexto('total-pacientes', pacientesUnicos);
  setTexto('total-consultas', futuras.length);
  setTexto('total-atendimentos', passadas.length);
}

/* =====================================================================
   RENDER — LISTA DE CHAMADA
   ===================================================================== */
function renderChamada(consultas) {
  const container = document.getElementById('lista-chamada');
  const vazio = document.getElementById('chamada-vazio');
  const titulo = document.getElementById('chamada-titulo');
  const badgePend = document.getElementById('chamada-pendentes');
  if (!container) return;

  // Define "hoje" como um intervalo
  const agora = new Date();
  const hojeInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const hojeFim = new Date(hojeInicio);
  hojeFim.setDate(hojeFim.getDate() + 1);

  // 1) Consultas de hoje
  const hoje = consultas
    .map((c) => ({ ...c, _ts: parseData(c)?.getTime() || 0 }))
    .filter((c) => c._ts >= hojeInicio.getTime() && c._ts < hojeFim.getTime())
    .sort((a, b) => a._ts - b._ts);

  // 2) Se vazio, próximas (7 dias)
  let lista = hoje;
  let modoTitulo = 'hoje';
  if (lista.length === 0) {
    const limite = hojeFim.getTime() + 7 * 86400000;
    lista = consultas
      .map((c) => ({ ...c, _ts: parseData(c)?.getTime() || 0 }))
      .filter((c) => c._ts >= hojeFim.getTime() && c._ts < limite)
      .sort((a, b) => a._ts - b._ts);
    modoTitulo = 'futuras';
  }

  // 3) Vazio total
  if (lista.length === 0) {
    container.innerHTML = '';
    if (vazio) vazio.style.display = '';
    if (titulo) titulo.textContent = '📋 Lista de chamada';
    if (badgePend) badgePend.textContent = '0';
    return;
  }

  // 4) Atualiza título + badge
  if (vazio) vazio.style.display = 'none';
  if (titulo) {
    titulo.textContent = modoTitulo === 'hoje'
      ? '📋 Lista de chamada de hoje'
      : '📋 Próximas consultas';
  }

  // Conta pendentes (não marcados como falta e ainda não passou)
  const pendentes = lista.filter((c) => {
    if (isFalta(c.id)) return false;
    return c._ts >= Date.now() - 5 * 60000; // considera pendente até 5min após
  }).length;
  if (badgePend) badgePend.textContent = pendentes;

  // 5) Renderiza cada item
  container.innerHTML = lista.map((c, i) => itemChamadaHtml(c, i === 0 && modoTitulo === 'hoje')).join('');

  // 6) Wire dos botões
  container.querySelectorAll('.btn-atender').forEach((btn) => {
    btn.addEventListener('click', () => iniciarAtendimento(btn.dataset.id));
  });
  container.querySelectorAll('.btn-falta').forEach((btn) => {
    btn.addEventListener('click', () => marcarFalta(btn.dataset.id, btn.dataset.paciente));
  });
}

function itemChamadaHtml(c, ehProximo) {
  const falta = isFalta(c.id);
  const data = new Date(c._ts);
  const hora = String(data.getHours()).padStart(2, '0') + ':' +
               String(data.getMinutes()).padStart(2, '0');
  const dataFmt = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const paciente = c.paciente?.usuario?.nome || c.paciente?.nome || 'Paciente';
  const cpf = c.paciente?.usuario?.cpf || c.paciente?.cpf || '';
  const especialidade = formatarEspecialidade(c.medico?.especialidade || c.especialidade);

  // Badge
  let badge = '';
  let badgeCls = '';
  if (falta) {
    badge = '❌ Faltou';
    badgeCls = 'badge-cancelada';
  } else if (ehProximo) {
    badge = '⏰ Próximo';
    badgeCls = 'badge-waiting';
  } else {
    badge = '🕐 Aguardando';
    badgeCls = 'badge-waiting';
  }

  const desabilitado = falta ? 'disabled' : '';

  return `
    <article class="consulta-item-card chamada-item ${falta ? 'chamada-falta' : ''}"
             data-id="${c.id ?? ''}">
      <div class="chamada-info">
        <div class="chamada-time">
          <span class="chamada-hora">${hora}</span>
          <span class="chamada-data">${dataFmt}</span>
        </div>
        <div class="chamada-details">
          <span class="${badgeCls}" style="display:inline-block; font-size:11px;
                padding:2px 10px; border-radius:10px; margin-bottom:6px;">
            ${badge}
          </span>
          <h3>${escapeHtml(paciente)}</h3>
          <p>${cpf ? 'CPF: ' + escapeHtml(cpf) + ' · ' : ''}${escapeHtml(especialidade)}</p>
        </div>
      </div>

      <div class="chamada-actions">
        <button type="button"
                class="btn btn-primary btn-atender"
                data-id="${c.id ?? ''}"
                ${desabilitado}
                style="width: auto; padding: 10px 18px; font-size: 14px;">
          Iniciar atendimento
        </button>
        <button type="button"
                class="btn btn-perigo btn-falta"
                data-id="${c.id ?? ''}"
                data-paciente="${escapeAttr(paciente)}"
                ${desabilitado}
                style="width: auto; padding: 10px 18px; font-size: 14px;">
          Marcar falta
        </button>
      </div>
    </article>
  `;
}

/* =====================================================================
   AÇÃO — INICIAR ATENDIMENTO
   ===================================================================== */
function iniciarAtendimento(consultaId) {
  if (!consultaId) return;
  window.location.href = `${PAGINA_ATENDIMENTO}?id=${encodeURIComponent(consultaId)}`;
}

/* =====================================================================
   AÇÃO — MARCAR FALTA
   ===================================================================== */
async function marcarFalta(consultaId, pacienteNome) {
  if (!consultaId) return;

  const confirmar = window.confirm(
    `Marcar falta de "${pacienteNome}"?\n\n` +
    'A consulta será registrada como não comparecida.'
  );
  if (!confirmar) return;

  // 1) Salva localmente (garantia)
  salvarFaltaLocal(consultaId);

  // 2) Best-effort no backend (não bloqueia a UI se falhar)
  const token = localStorage.getItem('token');
  tentarSalvarFaltaBackend(consultaId, token);

  // 3) Re-renderiza
  renderChamada(consultasMedico);

  // 4) Feedback
  mostrarToast(`Falta de "${pacienteNome}" registrada.`);
}

async function tentarSalvarFaltaBackend(consultaId, token) {
  const consulta = consultasMedico.find((c) => String(c.id) === String(consultaId));
  if (!consulta) return;

  // Tentativa 1: PUT com status=FALTOU
  try {
    const body = {
      id: consulta.id,
      especialidadeConsulta: consulta.medico?.especialidade || consulta.especialidade,
      medico: consulta.medico?.crm || consulta.medico?.matricula || consulta.medico,
      paciente: consulta.paciente?.id ?? consulta.paciente,
      data_horas: consulta.dia_horas || consulta.data_horas
               || consulta.dataHora || consulta.data_hora,
      status: 'FALTOU'
    };
    let resp = await fetch(`${API_BASE}/consultas`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    if (resp.ok) { console.info('[falta] salva no backend via PUT'); return; }

    // Tentativa 2: DELETE /consultas/{id}
    resp = await fetch(`${API_BASE}/consultas/${consultaId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resp.ok) { console.info('[falta] consulta removida via DELETE'); return; }
  } catch (err) {
    console.warn('[falta] backend não respondeu:', err);
  }
  // Se falhar tudo, fica só no localStorage (ok para o MVP)
}

/* =====================================================================
   FALTAS — localStorage
   Formato: { "<consultaId>": "2024-01-01T12:00:00Z" }
   ===================================================================== */
function lerFaltasLocais() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_FALTAS) || '{}');
  } catch { return {}; }
}

function isFalta(consultaId) {
  return !!faltasLocais[consultaId];
}

function salvarFaltaLocal(consultaId) {
  faltasLocais[consultaId] = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_FALTAS, JSON.stringify(faltasLocais));
  } catch (err) {
    console.error('[falta] não foi possível salvar localmente:', err);
  }
}

/* =====================================================================
   HELPERS
   ===================================================================== */
function mostrarVazio(titulo, texto) {
  const container = document.getElementById('lista-chamada');
  const vazio = document.getElementById('chamada-vazio');
  if (container) container.innerHTML = '';
  if (vazio) vazio.style.display = '';
  setTexto('chamada-vazio-titulo', titulo);
  setTexto('chamada-vazio-texto', texto);
  setTexto('chamada-pendentes', '0');
}

function parseData(c) {
  const raw = c.dia_horas || c.data_horas || c.dataHora || c.data_hora;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function formatarEspecialidade(esp) {
  if (!esp) return 'Consulta';
  return String(esp).replace(/_/g, ' ').toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mostrarToast(msg) {
  let toast = document.getElementById('toast-dashboard');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-dashboard';
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      background: #15803D; color: white;
      padding: 14px 20px; border-radius: 8px;
      font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999; opacity: 0; transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function setTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(s) {
  return String(s ?? '').replace(/"/g, '&quot;');
}