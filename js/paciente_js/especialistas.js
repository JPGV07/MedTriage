const API_BASE = 'https://triagemapi-production.up.railway.app';
const PAGINA_LOGIN = '../index.html';
const PAGINA_PERFIL = 'perfil_medico.html';

let todosMedicos = [];

document.addEventListener('DOMContentLoaded', async () => {
  // --- 1) Sessão ---
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = PAGINA_LOGIN; return; }

  // --- 2) Logout ---
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    ['token', 'userCpf', 'userName', 'userRole',
     'userMatricula', 'userDocument'].forEach((k) => localStorage.removeItem(k));
    window.location.href = PAGINA_LOGIN;
  });

  // --- 3) Wire dos filtros ---
  document.getElementById('btn-buscar')?.addEventListener('click', aplicarFiltros);
  document.getElementById('filtro-especialidade')
    ?.addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-cidade')
    ?.addEventListener('change', aplicarFiltros);

  // --- 4) Carrega e renderiza ---
  await carregarMedicos();
});

/* =====================================================================
   CARREGAR MÉDICOS
   ===================================================================== */
async function carregarMedicos() {
  const token = localStorage.getItem('token');
  const lista = document.getElementById('lista-medicos');
  if (!lista) return;

  const [medicosRaw, users] = await Promise.all([
    fetchLista('/medicos', '/medico', token),
    fetchLista('/users', null, token)
  ]);

  if (!medicosRaw) {
    lista.innerHTML = estadoVazioHtml(
      'Não foi possível carregar médicos',
      'Verifique sua conexão e tente novamente.',
      'Tentar novamente',
      () => carregarMedicos()
    );
    return;
  }

  todosMedicos = medicosRaw
    .map((m) => normalizarMedico(m, users || []))
    .filter((m) => m.status === 'ATIVO');

  if (todosMedicos.length === 0) {
    lista.innerHTML = estadoVazioHtml(
      'Nenhum médico disponível',
      'Ainda não há médicos cadastrados no sistema.'
    );
    document.getElementById('titulo-resultados').textContent = 'Médicos encontrados (0)';
    return;
  }

  aplicarFiltros();
}

/* =====================================================================
   NORMALIZE
   ===================================================================== */
function normalizarMedico(m, users) {
  const funcionario = m.funcionario || {};
  const usuario = funcionario.usuario || m.usuario || {};
  const cpf = usuario.cpf || '';

  const userMatch = users.find((u) => u && u.cpf === cpf);

  const enderecos = funcionario.endereco || m.endereco || [];
  const endereco = Array.isArray(enderecos) ? enderecos[0] : null;

  return {
    id: m.id ?? null,
    crm: m.crm || '',
    matricula: funcionario.matricula || m.matricula || '',
    especialidade: m.especialidade || '',
    especialidadeLabel: formatarEspecialidade(m.especialidade),
    preco: Number(m.preco_consulta || 0),
    nome: usuario.nome || userMatch?.nome || 'Médico',
    cidade: endereco?.cidade || '',
    endereco: endereco,
    status: (m.status || m.statusMedic || 'ATIVO').toUpperCase()
  };
}

/* =====================================================================
   FILTRO
   ===================================================================== */
function aplicarFiltros() {
  const esp = document.getElementById('filtro-especialidade')?.value || 'Todas';
  const cidade = document.getElementById('filtro-cidade')?.value || 'Todas';

  const filtrados = todosMedicos.filter((m) => {
    if (esp !== 'Todas' && m.especialidade !== esp) return false;
    if (cidade !== 'Todas') {
      // Se o médico não tem cidade, ele não aparece no filtro específico
      if (!m.cidade) return false;
      if (m.cidade.toLowerCase() !== cidade.toLowerCase()) return false;
    }
    return true;
  });

  renderLista(filtrados);
}

/* =====================================================================
   RENDER
   ===================================================================== */
function renderLista(medicos) {
  const lista = document.getElementById('lista-medicos');
  const titulo = document.getElementById('titulo-resultados');
  if (!lista) return;

  if (medicos.length === 0) {
    lista.innerHTML = estadoVazioHtml(
      'Nenhum médico encontrado',
      'Tente ajustar os filtros de especialidade ou cidade.'
    );
    if (titulo) titulo.textContent = 'Médicos encontrados (0)';
    return;
  }

  if (titulo) titulo.textContent = `Médicos encontrados (${medicos.length})`;

  lista.innerHTML = medicos.map(medicoCardHtml).join('');

  // Wire dos botões "Agendar consulta"
  lista.querySelectorAll('.btn-agendar-medico').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const crm = btn.dataset.crm;
      if (id) {
        window.location.href = `${PAGINA_PERFIL}?id=${encodeURIComponent(id)}`;
      } else if (crm) {
        window.location.href = `${PAGINA_PERFIL}?crm=${encodeURIComponent(crm)}`;
      }
    });
  });
}

function medicoCardHtml(m) {
  const preco = m.preco > 0
    ? m.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'A combinar';

  const local = m.cidade || 'Local não informado';
  const iniciais = iniciaisDoNome(m.nome);

  return `
    <article class="doctor-card">
      <div class="doctor-info">
        <div class="doctor-avatar" aria-hidden="true">
          <span style="font-weight:700; font-size:22px;">${escapeHtml(iniciais)}</span>
        </div>
        <div class="doctor-details">
          <h3>${escapeHtml(m.nome)}</h3>
          <p class="specialty">${escapeHtml(m.especialidadeLabel)}${m.crm ? ' · ' + escapeHtml(m.crm) : ''}</p>
          <p class="location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${escapeHtml(local)}
          </p>
        </div>
      </div>
      <div class="doctor-action">
        <p class="price">${escapeHtml(preco)}</p>
        <button type="button"
                class="btn btn-primary btn-agendar-medico"
                data-id="${m.id ?? ''}"
                data-crm="${escapeAttr(m.crm)}"
                style="width: auto; padding: 10px 20px; font-size: 14px;">
          Agendar consulta
        </button>
      </div>
    </article>
  `;
}

/* =====================================================================
   HELPERS
   ===================================================================== */
async function fetchLista(path1, path2, token) {
  const paths = path2 ? [path1, path2] : [path1];
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  for (const path of paths) {
    try {
      const resp = await fetch(`${API_BASE}${path}`, { headers });
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn(`[especialistas] ${path} falhou:`, err);
    }
  }
  return null;
}

function formatarEspecialidade(esp) {
  if (!esp) return 'Especialista';
  return String(esp).replace(/_/g, ' ').toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function iniciaisDoNome(nome) {
  const partes = String(nome || 'M').trim().split(/\s+/);
  const primeira = partes[0]?.[0] || 'M';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function estadoVazioHtml(titulo, texto, botaoTexto, onClick) {
  const btn = botaoTexto
    ? `<button type="button" class="btn btn-outline"
         style="width:auto; margin-top:16px;" id="btn-retry">${escapeHtml(botaoTexto)}</button>`
    : '';
  setTimeout(() => {
    document.getElementById('btn-retry')?.addEventListener('click', () => onClick?.());
  }, 0);
  return `
    <div class="laudos-vazio" style="margin-top:0;">
      <h3>${escapeHtml(titulo)}</h3>
      <p>${escapeHtml(texto)}</p>
      ${btn}
    </div>
  `;
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