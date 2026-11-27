/* =====================================================================
   MedTriage — Perfil Público do Médico (visto pelo paciente)

   URL esperada:
     perfil_medico.html?id=<id>
     perfil_medico.html?crm=<crm>
     perfil_medico.html?matricula=<matricula>

   Endpoints:
     GET /medicos            (best-effort)
     GET /users/find?cpf=X   (documentado — fallback p/ nome)
     GET /users              (documentado — fallback p/ nome)
   ===================================================================== */

const API_BASE = 'https://triagemapi-production.up.railway.app';
const PAGINA_LOGIN = 'index.html';
const PAGINA_AGENDAR = 'agendar_etapa1.html';

let medico = null;

document.addEventListener('DOMContentLoaded', async () => {
  // --- 1) Sessão ---
  const token = localStorage.getItem('token');
  const cpfLogado = localStorage.getItem('userCpf');
  if (!token) { window.location.href = PAGINA_LOGIN; return; }

  // --- 2) Nome no header (best-effort) ---
  preencherNomeHeader(token, cpfLogado);

  // --- 3) Lê a query string ---
  const params = new URLSearchParams(window.location.search);
  const alvo = {
    id: params.get('id') || params.get('medicoId'),
    crm: params.get('crm'),
    matricula: params.get('matricula')
  };

  if (!alvo.id && !alvo.crm && !alvo.matricula) {
    return mostrarErro(
      'Médico não especificado',
      'Volte para a busca e clique em "Agendar consulta" no especialista desejado.'
    );
  }

  // --- 4) Carrega lista de médicos ---
  const medicos = await fetchLista('/medicos', '/medico', token);
  if (!medicos) {
    return mostrarErro(
      'Não foi possível carregar o perfil',
      'Verifique sua conexão e tente novamente.'
    );
  }

  const encontrado = medicos.find((m) => combinaAlvo(m, alvo));
  if (!encontrado) {
    return mostrarErro(
      'Médico não encontrado',
      'Esse especialista pode ter sido removido. Volte para a busca.'
    );
  }

  // --- 5) Carrega nome do usuário (cruza /users) ---
  const users = await fetchLista('/users', null, token) || [];
  medico = normalizarMedico(encontrado, users);

  // --- 6) Renderiza ---
  renderMedico(medico);

  // --- 7) Wire do botão "Agendar" ---
  const btnAgendar = document.getElementById('btn-agendar');
  if (btnAgendar) {
    btnAgendar.disabled = false;
    btnAgendar.addEventListener('click', () => {
      const q = new URLSearchParams();
      if (medico.id != null) q.set('medicoId', medico.id);
      if (medico.crm) q.set('crm', medico.crm);
      window.location.href = `${PAGINA_AGENDAR}?${q.toString()}`;
    });
  }
});

/* =====================================================================
   HEADER
   ===================================================================== */
async function preencherNomeHeader(token, cpf) {
  const el = document.getElementById('user-greeting');
  if (!el || !cpf) return;

  try {
    const resp = await fetch(
      `${API_BASE}/users/find?cpf=${encodeURIComponent(cpf)}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!resp.ok) return;
    const txt = (await resp.text()).trim();
    let nome = txt;
    try {
      const j = JSON.parse(txt);
      if (typeof j === 'string') nome = j;
      else if (j && typeof j === 'object') nome = j.nome ?? '';
    } catch {}
    nome = String(nome).trim().replace(/\s+/g, ' ');
    if (nome) el.textContent = `Olá, ${nome.split(' ')[0]}`;
  } catch (err) {
    console.warn('[perfil_medico_publico] header falhou:', err);
  }
}

/* =====================================================================
   FETCH
   ===================================================================== */
async function fetchLista(path1, path2, token) {
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
      console.warn(`[perfil_medico_publico] ${path} falhou:`, err);
    }
  }
  return null;
}

/* =====================================================================
   MATCH E NORMALIZE
   ===================================================================== */
function combinaAlvo(m, alvo) {
  if (!m) return false;
  if (alvo.id != null && String(m.id) === String(alvo.id)) return true;
  if (alvo.crm) {
    const crm = (m.crm || '').toString().toUpperCase();
    if (crm && crm === alvo.crm.toUpperCase()) return true;
  }
  if (alvo.matricula) {
    const mat = (m.funcionario?.matricula || m.matricula || '').toString().toUpperCase();
    if (mat && mat === alvo.matricula.toUpperCase()) return true;
  }
  return false;
}

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
    nome: usuario.nome || userMatch?.nome || m.nome || 'Médico',
    endereco: montarEndereco(endereco),
    bio: m.bio || m.descricao || '',
    status: (m.status || m.statusMedic || 'ATIVO').toUpperCase()
  };
}

/* =====================================================================
   RENDER
   ===================================================================== */
function renderMedico(m) {
  setTexto('pub-nome', m.nome);
  setTexto('pub-especialidade', m.especialidadeLabel);

  // CRM com separador condicional
  if (m.crm) {
    setTexto('pub-crm', m.crm);
    const sep = document.getElementById('pub-separador');
    if (sep) sep.style.display = '';
  } else {
    document.getElementById('pub-crm').style.display = 'none';
  }

  setTexto('pub-bio', m.bio || gerarBioPadrao(m.nome, m.especialidadeLabel));
  setTexto('pub-endereco', m.endereco || 'Endereço não informado');
  setTexto(
    'pub-preco',
    m.preco > 0
      ? m.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : 'A combinar'
  );

  // Rating: backend não tem — oculta
  const ratingBox = document.getElementById('pub-rating-box');
  if (ratingBox) ratingBox.style.display = 'none';

  // Título da aba
  document.title = `${m.nome} · ${m.especialidadeLabel} | MedTriage`;
}

function mostrarErro(titulo, msg) {
  setTexto('pub-nome', titulo);
  setTexto('pub-especialidade', '—');
  setTexto('pub-crm', '—');
  setTexto('pub-bio', msg);
  setTexto('pub-endereco', '—');
  setTexto('pub-preco', '—');

  const btn = document.getElementById('btn-agendar');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    btn.textContent = 'Indisponível';
  }

  const aviso = document.getElementById('aviso-perfil');
  if (aviso) {
    aviso.style.display = '';
    aviso.style.background = '#FEE2E2';
    aviso.style.color = '#DC2626';
    aviso.textContent = msg;
  }
}

/* =====================================================================
   HELPERS
   ===================================================================== */
function montarEndereco(end) {
  if (!end) return '';
  const partes = [];
  if (end.rua) partes.push(end.rua);
  if (end.numero) partes.push(`nº ${end.numero}`);
  if (end.cidade) partes.push(end.cidade);
  if (end.estado) partes.push(end.estado);
  return partes.join(', ');
}

function formatarEspecialidade(esp) {
  if (!esp) return 'Especialista';
  return String(esp).replace(/_/g, ' ').toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function gerarBioPadrao(nome, especialidade) {
  const primeiro = nome.split(' ').slice(0, 2).join(' ');
  return (
    `${primeiro} é especialista em ${especialidade.toLowerCase()}, com atendimento ` +
    `humanizado e foco em diagnóstico preciso. Realiza consultas presenciais com ` +
    `escuta atenta e plano terapêutico personalizado para cada paciente.`
  );
}

function setTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}