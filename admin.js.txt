/* =========================================================
   ADMIN.JS — Painel do administrador
   =========================================================
   Permite:
     - Criar regras booleanas (sintomas → classificação + texto)
     - Ver/excluir as regras ativas
     - Ver a fila completa e remover pacientes
   ========================================================= */

/* ---------- Lista fixa de todos os sintomas disponíveis ---------- */
const todosSintomas = [
  'febre_alta', 'pressao_alta',
  'parada_cardiaca', 'dificuldade_respirar_grave', 'fratura_exposta', 'convulsao',
  'hemorragia', 'queimadura_3_grau', 'dor_peito_intensa', 'confusao_mental',
  'alucinacoes', 'dificudade_de_locomocao', 'dificudade_da_fala', 'envenenamento',
  'vomitos_persistentes', 'desidratacao', 'dor_abdominal_intensa', 'desmaio_recente',
  'cefaleia_intratavel', 'palpitacoes', 'tontura_persistente', 'anemia_grave',
  'sangramento_nasal', 'nauseas_intensas', 'diarreia_aguda', 'visao_embacada',
  'dor_cabeca', 'tosse_persistente', 'dor_garganta', 'fadiga', 'dor_lombar',
  'insonia', 'ansiedade', 'coriza', 'espirros', 'dor_muscular', 'calafrios', 'mal_estar',
  'febre_40', 'febre_38', 'dor_cabeca_forte', 'fadiga_extrema', 'ictericia_grave',
  'hemoptise', 'convulsao_focal', 'sangramento_nasal_abundante'
];

/* =========================================================
   RENDERIZA OS CHECKBOXES de sintomas no admin
   ========================================================= */
function renderizarSintomasAdmin() {
  const grid = document.getElementById('listaSintomasAdmin');
  grid.innerHTML = todosSintomas.map(sintoma =>
    `<label>
      <input type="checkbox" class="admin-sintoma-check" value="${sintoma}">
      ${Utils.formatarNome(sintoma)}
    </label>`
  ).join('');
}

/* =========================================================
   OBTER REGRAS — lê do Storage (ou cria padrão na 1ª vez)
   ========================================================= */
function obterRegras() {
  const salvas = Storage.get(Storage.keys.regras);
  if (salvas) return salvas;

  // Regras padrão criadas no primeiro acesso
  const padrao = [
    { sintomasObrigatorios: ['febre_alta', 'pressao_alta'], definirComo: 'vermelho', alertaTexto: '⚠️ REGRA ADMIN: Paciente com febre E pressão elevada - risco alto.' },
    { sintomasObrigatorios: ['febre_40', 'tosse_persistente'], definirComo: 'vermelho', alertaTexto: '⚠️ REGRA ADMIN: Suspeita de pneumonia bacteriana grave.' },
    { sintomasObrigatorios: ['ansiedade', 'palpitacoes'], definirComo: 'amarelo', alertaTexto: '⚠️ REGRA ADMIN: Crise de pânico ou ansiedade aguda sob monitoramento cardíaco.' },
    { sintomasObrigatorios: ['coriza', 'espirros', 'dor_garganta'], definirComo: 'verde', alertaTexto: 'ℹ️ REGRA ADMIN: Quadro compatível com virose respiratória simples. Ambulatório.' }
  ];
  Storage.set(Storage.keys.regras, padrao);
  return padrao;
}

/* =========================================================
   ATUALIZAR TABELA DE REGRAS
   ========================================================= */
function atualizarTabelaRegras() {
  const regras = obterRegras();
  const tabela = document.getElementById('corpoTabelaRegras');

  // Sem regras → mostra mensagem
  if (regras.length === 0) {
    tabela.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhuma regra customizada ativa.</td></tr>';
    return;
  }

  // Uma linha por regra
  tabela.innerHTML = regras.map((regra, index) => `
    <tr>
      <td><strong>${regra.sintomasObrigatorios.map(Utils.formatarNome).join(' + ')}</strong></td>
      <td><span class="badge ${regra.definirComo}">${regra.definirComo}</span></td>
      <td><span style="color:#bbb">${regra.alertaTexto}</span></td>
      <td><button class="btn-danger" onclick="deletarRegra(${index})">Excluir</button></td>
    </tr>
  `).join('');
}

/* =========================================================
   SALVAR NOVA REGRA
   Requer ≥ 2 sintomas selecionados + um texto de instrução.
   ========================================================= */
function salvarNovaRegra() {
  const selecionados = Array.from(
    document.querySelectorAll('.admin-sintoma-check:checked')
  ).map(cb => cb.value);

  const cor   = document.getElementById('regraCor').value;
  const texto = document.getElementById('regraTexto').value.trim();

  if (selecionados.length < 2) {
    alert('Selecione pelo menos 2 sintomas para montar uma combinação de regras!');
    return;
  }
  if (!texto) {
    alert('Insira uma mensagem de instrução para os enfermeiros!');
    return;
  }

  const regras = obterRegras();
  regras.push({
    sintomasObrigatorios: selecionados,
    definirComo: cor,
    alertaTexto: `⚠️ REGRA ADMIN: ${texto}`
  });
  Storage.set(Storage.keys.regras, regras);

  atualizarTabelaRegras();

  // Limpa o formulário
  document.querySelectorAll('.admin-sintoma-check').forEach(cb => cb.checked = false);
  document.getElementById('regraTexto').value = '';

  alert('Regra integrada com sucesso!');
}

/* =========================================================
   DELETAR REGRA pelo índice
   ========================================================= */
function deletarRegra(index) {
  const regras = obterRegras();
  regras.splice(index, 1);
  Storage.set(Storage.keys.regras, regras);
  atualizarTabelaRegras();
}

/* =========================================================
   VERIFICAR ACESSO — só admin
   ========================================================= */
function verificarAcessoAdmin() {
  Auth.requireRole('admin');
}

/* Logout */
function logout() { Auth.logout(); }

/* =========================================================
   ATUALIZAR TABELA DA FILA COMPLETA
   ========================================================= */
function atualizarTabelaFilaAdmin() {
  const fila = Storage.get(Storage.keys.fila, []);
  const tbody = document.getElementById('corpoTabelaFilaAdmin');

  if (fila.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Nenhum paciente na fila.</td></tr>';
    return;
  }

  tbody.innerHTML = fila.map(paciente => {
    const condicoesLista = paciente.condicoes?.length ? paciente.condicoes.join(', ') : 'Nenhuma';
    const sintomasLista  = paciente.sintomas?.length  ? paciente.sintomas.join(', ')  : 'Nenhum';

    let regraTexto = '—';
    if (paciente.regrasAdminAtendidas?.length) {
      regraTexto = paciente.regrasAdminAtendidas.join('; ');
      if (regraTexto.length > 60) regraTexto = regraTexto.substring(0, 57) + '...';
    }

    return `
      <tr>
        <td>${paciente.nome || '—'}</td>
        <td>${paciente.genero || 'Não informado'}</td>
        <td><span class="badge ${paciente.risco}">${paciente.risco.toUpperCase()}</span></td>
        <td>${paciente.especialidade || '—'}</td>
        <td class="coluna-texto">${condicoesLista}</td>
        <td class="coluna-texto">${sintomasLista}</td>
        <td style="color: #ffaa88;">${regraTexto}</td>
        <td><button class="btn-remover" onclick="removerPacienteFila('${paciente.cpf}')">🗑️ Remover</button></td>
      </tr>
    `;
  }).join('');
}

/* =========================================================
   REMOVER PACIENTE da fila (com confirmação)
   ========================================================= */
function removerPacienteFila(cpf) {
  if (!confirm('Tem certeza que deseja remover este paciente da fila?')) return;

  const fila = Storage.get(Storage.keys.fila, []);
  const novaFila = fila.filter(p => p.cpf !== cpf);

  if (novaFila.length === fila.length) { alert('Paciente não encontrado.'); return; }

  Storage.set(Storage.keys.fila, novaFila);
  atualizarTabelaFilaAdmin();
  alert('Paciente removido da fila com sucesso!');
}

/* ---------- Boot: valida acesso e inicia atualizações ---------- */
window.onload = function() {
  verificarAcessoAdmin();
  renderizarSintomasAdmin();
  atualizarTabelaRegras();
  atualizarTabelaFilaAdmin();
  setInterval(atualizarTabelaFilaAdmin, 3000); // polling de 3s
};