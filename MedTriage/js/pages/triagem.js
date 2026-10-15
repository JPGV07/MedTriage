/* =========================================================
   TRIAGEM.JS — Lógica da triagem inteligente
   =========================================================
   Combina três fontes de pontuação:
     1. Regras booleanas do admin (se bater → define risco direto)
     2. Pesos por sintoma marcado manualmente
     3. Pesos automáticos (aferição + condições do cadastro)
   ========================================================= */

/* ---------- Catálogo de sintomas organizado em categorias ---------- */
const categoriasSintomas = {
  graves: {
    cor: 'rgba(239,68,68,.2)',
    nome: '🔴 GRAVE',
    itens: [
      { id: 'parada_cardiaca',            nome: 'Parada Cardíaca',               peso: 200 },
      { id: 'dificuldade_respirar_grave', nome: 'Dificuldade Respiratória Grave', peso: 180 },
      { id: 'fratura_exposta',            nome: 'Fratura Exposta',               peso: 170 },
      { id: 'convulsao',                  nome: 'Convulsão',                     peso: 160 },
      { id: 'hemorragia',                 nome: 'Hemorragia Intensa',            peso: 160 },
      { id: 'queimadura_3_grau',          nome: 'Queimadura 3º Grau',            peso: 150 },
      { id: 'dor_peito_intensa',          nome: 'Dor no Peito Intensa',          peso: 140 },
      { id: 'confusao_mental',            nome: 'Confusão Mental',               peso: 130 },
      { id: 'alucinacoes',                nome: 'Alucinações',                   peso: 120 },
      // CORRIGIDO: antes estava "dificudede_de_locomocao" (typo)
      { id: 'dificudade_de_locomocao',    nome: 'Dificuldade de Locomoção',      peso: 140 },
      { id: 'dificudade_da_fala',         nome: 'Dificuldade da Fala',           peso: 120 },
      { id: 'envenenamento',              nome: 'Envenenamento',                 peso: 120 }
    ]
  },
  moderados: {
    cor: 'rgba(234,179,8,.2)',
    nome: '🟡 MODERADO',
    itens: [
      { id: 'vomitos_persistentes',   nome: 'Vômitos Persistentes',  peso: 80 },
      { id: 'desidratacao',           nome: 'Desidratação',          peso: 75 },
      { id: 'dor_abdominal_intensa',  nome: 'Dor Abdominal Intensa', peso: 70 },
      { id: 'desmaio_recente',        nome: 'Desmaio Recente',       peso: 65 },
      { id: 'cefaleia_intratavel',    nome: 'Dor de Cabeça Intensa', peso: 60 },
      { id: 'palpitacoes',            nome: 'Palpitações',           peso: 55 },
      { id: 'tontura_persistente',    nome: 'Tontura Persistente',   peso: 50 },
      { id: 'anemia_grave',           nome: 'Anemia Grave',          peso: 45 },
      { id: 'sangramento_nasal',      nome: 'Sangramento Nasal',     peso: 40 },
      { id: 'nauseas_intensas',       nome: 'Náuseas intensas',      peso: 45 },
      { id: 'diarreia_aguda',         nome: 'Diarreia aguda',        peso: 50 },
      { id: 'visao_embacada',         nome: 'Visão Embaçada',        peso: 40 }
    ]
  },
  leves: {
    cor: 'rgba(34,197,94,.2)',
    nome: '🟢 LEVE',
    itens: [
      { id: 'dor_cabeca',        nome: 'Dor de Cabeça',              peso: 20 },
      { id: 'tosse_persistente', nome: 'Tosse Persistente',          peso: 18 },
      { id: 'dor_garganta',      nome: 'Dor de Garganta',            peso: 12 },
      { id: 'fadiga',            nome: 'Fadiga',                     peso: 10 },
      { id: 'dor_lombar',        nome: 'Dor Lombar',                 peso: 8 },
      { id: 'insonia',           nome: 'Insônia',                    peso: 6 },
      { id: 'ansiedade',         nome: 'Ansiedade',                  peso: 5 },
      { id: 'coriza',            nome: 'Coriza',                     peso: 3 },
      { id: 'espirros',          nome: 'Espirros',                   peso: 2 },
      { id: 'dor_muscular',      nome: 'Dor muscular generalizada',  peso: 12 },
      { id: 'calafrios',         nome: 'Calafrios',                  peso: 10 },
      { id: 'mal_estar',         nome: 'Mal-estar geral',            peso: 8 }
    ]
  }
};

let pontuacaoExtra = 0;      // soma de peso vinda da aferição/condições
let sintomasAfericaoIds = []; // IDs de sintomas detectados na aferição

/* =========================================================
   CARREGAR SINTOMAS — gera os checkboxes dinamicamente
   ========================================================= */
function carregarSintomas() {
  let html = '<div class="sintomas-grid">';
  for (const [tipo, config] of Object.entries(categoriasSintomas)) {
    html += `<div class="categoria" style="background:${config.cor}">
      <h3>${config.nome}</h3><div class="grid-opcoes">`;
    config.itens.forEach(s => {
      html += `<label>
        <input type="checkbox" class="sintoma-check"
               data-sintoma="${s.id}" data-peso="${s.peso}"
               onchange="atualizarPrioridade()">
        ${s.nome}
      </label>`;
    });
    html += `</div></div>`;
  }
  html += '</div>';
  document.getElementById('sintomasContainer').innerHTML = html;
}

/* =========================================================
   CARREGAR DADOS — mostra os dados do paciente no topo
   ========================================================= */
function carregarDadosPaciente() {
  const paciente = Storage.get(Storage.keys.paciente);
  if (!paciente) { window.location.href = 'cadastro.html'; return; }

  const condicoesTexto = (paciente.condicoes?.length)
    ? paciente.condicoes.join(', ')
    : 'Nenhuma';

  document.getElementById('pacienteDetails').innerHTML = `
    <div class="info-item"><div class="info-label">Nome</div><div class="info-value">${paciente.nome}</div></div>
    <div class="info-item"><div class="info-label">Telefone</div><div class="info-value">${paciente.telefone}</div></div>
    <div class="info-item"><div class="info-label">CPF</div><div class="info-value">${paciente.cpf}</div></div>
    <div class="info-item"><div class="info-label">Especialidade</div><div class="info-value">${paciente.especialidade}</div></div>
    <div class="info-item"><div class="info-label">Gênero</div><div class="info-value">${paciente.genero}</div></div>
    <div class="info-item"><div class="info-label">Condições</div><div class="info-value">${condicoesTexto}</div></div>
  `;
}

/* =========================================================
   CARREGAR PESOS DA AFERIÇÃO
   Converte aferição (pressão/temperatura) em sintomas + pontuação.
   ========================================================= */
function carregarPesosAfericao() {
  const afericao = Storage.get(Storage.keys.afericao);
  sintomasAfericaoIds = [];
  pontuacaoExtra = 0;

  if (afericao) {
    const pressao = afericao.pressao;
    if (pressao) {
      const [sist, diast] = pressao.split('/').map(Number);
      if (sist >= 110 || diast >= 80) {
        sintomasAfericaoIds.push('pressao_alta');
        pontuacaoExtra += 40;
      }
    }
    if (afericao.temperatura && afericao.temperatura >= 37.2) {
      sintomasAfericaoIds.push('febre_alta');
      pontuacaoExtra += 30;
    }
  }

  // Adiciona pesos das condições do cadastro
  const paciente = Storage.get(Storage.keys.paciente);
  if (paciente?.pesoCondicoes) pontuacaoExtra += paciente.pesoCondicoes;
}

/* =========================================================
   OBTER IDS — junta sintomas automáticos (aferição) + manuais
   ========================================================= */
function obterIdsSintomasPaciente() {
  const ids = [...sintomasAfericaoIds];
  document.querySelectorAll('.sintoma-check:checked').forEach(cb =>
    ids.push(cb.getAttribute('data-sintoma'))
  );
  return ids;
}

/* =========================================================
   REGRAS BOOLEANAS DO ADMIN
   Se TODOS os sintomas obrigatórios da regra estiverem presentes,
   devolve a classificação definida pelo admin.
   ========================================================= */
function avaliarRegrasBooleanas(sintomasIds) {
  const regras = Storage.get(Storage.keys.regras);
  if (!Array.isArray(regras) || regras.length === 0) return null;

  const set = new Set(sintomasIds);
  for (const regra of regras) {
    if (regra.sintomasObrigatorios.every(s => set.has(s))) return regra.definirComo;
  }
  return null;
}

/* Igual à anterior, mas devolve o TEXTO da regra (para exibir no aviso) */
function avaliarRegrasComMensagens(sintomasIds) {
  const regras = Storage.get(Storage.keys.regras);
  if (!regras) return null;

  const set = new Set(sintomasIds);
  for (const regra of regras) {
    // ✅ CORRIGIDO: "alertaTexto" (com "o" no final) — antes estava "alertaText"
    if (regra.sintomasObrigatorios.every(s => set.has(s))) return regra.alertaTexto;
  }
  return null;
}

/* =========================================================
   ATUALIZAR PRIORIDADE — recalcula o badge em tempo real
   ========================================================= */
function atualizarPrioridade() {
  const sintomasIds = obterIdsSintomasPaciente();

  // 1) Tenta primeiro a regra booleana do admin
  const riscoPorRegra = avaliarRegrasBooleanas(sintomasIds);
  let risco = null;

  if (riscoPorRegra) {
    risco = riscoPorRegra;
  } else {
    // 2) Sem regra: usa pontuação total
    let total = pontuacaoExtra;
    document.querySelectorAll('.sintoma-check:checked').forEach(box =>
      total += parseInt(box.getAttribute('data-peso'), 10)
    );
    if (total >= 150) risco = 'vermelho';
    else if (total >= 70) risco = 'amarelo';
    else risco = 'verde';
  }

  // Atualiza o badge visual
  const badge = document.getElementById('prioridadeBadge');
  if (risco === 'vermelho') { badge.className = 'prioridade-badge vermelho'; badge.innerText = '🔴 GRAVE'; }
  else if (risco === 'amarelo') { badge.className = 'prioridade-badge amarelo'; badge.innerText = '🟡 MODERADO'; }
  else { badge.className = 'prioridade-badge verde'; badge.innerText = '🟢 LEVE'; }

  // Mostra/esconde o aviso da regra do admin
  const msgRegra = avaliarRegrasComMensagens(sintomasIds);
  const avisoDiv = document.getElementById('avisoRegraAdmin');
  if (msgRegra) {
    document.getElementById('textoRegraAdmin').innerHTML = msgRegra;
    avisoDiv.style.display = 'block';
  } else {
    avisoDiv.style.display = 'none';
  }
}

/* =========================================================
   FINALIZAR TRIAGEM — envia o paciente para a fila
   ========================================================= */
function finalizarTriagem() {
  const checkboxes = document.querySelectorAll('.sintoma-check:checked');
  if (checkboxes.length === 0) { alert('Selecione pelo menos um sintoma.'); return; }

  // Nomes legíveis dos sintomas manuais
  const sintomasManuais = Array.from(checkboxes).map(item =>
    item.parentElement.innerText.trim()
  );

  const paciente = Storage.get(Storage.keys.paciente);
  const condicoesNomes = paciente.condicoes || [];

  // Sintomas que vieram da aferição automática
  const sintomasAfericaoNomes = [];
  if (sintomasAfericaoIds.includes('pressao_alta')) sintomasAfericaoNomes.push('Pressão arterial elevada');
  if (sintomasAfericaoIds.includes('febre_alta'))   sintomasAfericaoNomes.push('Febre alta');

  // Descobre o risco pelo texto do badge
  const badge = document.getElementById('prioridadeBadge');
  let risco = 'verde';
  if (badge.innerText.includes('GRAVE')) risco = 'vermelho';
  else if (badge.innerText.includes('MODERADO')) risco = 'amarelo';

  // Pontuação final (só para registro)
  let pontuacaoTotal = pontuacaoExtra;
  checkboxes.forEach(box => pontuacaoTotal += parseInt(box.getAttribute('data-peso'), 10));

  // Registra TODAS as regras do admin que o paciente ativou
  const sintomasIds = obterIdsSintomasPaciente();
  const regras = Storage.get(Storage.keys.regras, []);
  const regrasAtendidas = [];
  const set = new Set(sintomasIds);
  for (const regra of regras) {
    if (regra.sintomasObrigatorios.every(s => set.has(s))) regrasAtendidas.push(regra.alertaTexto);
  }

  // Objeto que vai para a fila
  const pacienteFila = {
    nome: paciente.nome,
    cpf: paciente.cpf,
    especialidade: paciente.especialidade,
    risco,
    condicoes: condicoesNomes,
    sintomas: sintomasManuais,
    sintomasAfericao: sintomasAfericaoNomes,
    pontuacao: pontuacaoTotal,
    dataAtendimento: new Date().toISOString(),
    afericao: Storage.get(Storage.keys.afericao),
    genero: paciente.genero,
    regrasAdminAtendidas: regrasAtendidas
  };

  // Adiciona/replace na fila (evita duplicar pelo CPF)
  let fila = Storage.get(Storage.keys.fila, []);
  fila = fila.filter(p => p.cpf !== paciente.cpf);
  fila.push(pacienteFila);
  Storage.set(Storage.keys.fila, fila);

  alert(`✅ Paciente cadastrado na fila com sucesso!\n\n📌 Classificação: ${badge.innerText}\n👨‍⚕️ Especialidade: ${paciente.especialidade}\n🩺 Sintomas registrados: ${sintomasManuais.length}`);
  window.location.href = 'index.html';
}

/* ---------- Boot: roda tudo ao carregar ---------- */
window.onload = () => {
  carregarDadosPaciente();
  carregarSintomas();
  carregarPesosAfericao();
  atualizarPrioridade();
};