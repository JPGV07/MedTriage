/* =========================================================
   MEDICO.JS — Lógica do painel do médico
   =========================================================
   - Restringe acesso ao role 'medico'
   - Filtra a fila pela especialidade do médico logado
   - Reordena a fila por prioridade (vermelho > amarelo > verde)
   - Permite chamar paciente (remove da fila + avisa TV)
   ========================================================= */

let especialidadeAtual = '';
let consultorioAtual  = '';
let nomeMedicoAtual   = '';

/* Valida acesso e preenche cabeçalho com nome + especialidade */
function verificarAcesso() {
  const user = Auth.requireRole('medico');
  if (!user) return;

  especialidadeAtual = user.especialidade;
  consultorioAtual   = Utils.getConsultorioPorEspecialidade(especialidadeAtual);
  nomeMedicoAtual    = user.nome;

  document.getElementById('nomeMedico').innerHTML = nomeMedicoAtual;
  document.getElementById('especialidadeMedico').innerHTML =
    `${especialidadeAtual} (${consultorioAtual})`;
}

/* =========================================================
   ORDENAR FILA
   Regra: todos os vermelhos primeiro.
   Depois intercala 3 amarelos : 1 verde.
   ========================================================= */
function ordenarFilaRegra(fila) {
  const vermelhos = fila.filter(p => p.risco === 'vermelho');
  const amarelos  = fila.filter(p => p.risco === 'amarelo');
  const verdes    = fila.filter(p => p.risco === 'verde');

  const resultado = [...vermelhos];
  let i = 0, j = 0;
  while (i < amarelos.length || j < verdes.length) {
    for (let k = 0; k < 3 && i < amarelos.length; k++) resultado.push(amarelos[i++]);
    if (j < verdes.length) resultado.push(verdes[j++]);
  }
  return resultado;
}

/* =========================================================
   CARREGAR FILA — monta a tabela do médico
   ========================================================= */
function carregarFila() {
  let fila = Storage.get(Storage.keys.fila, []);
  fila = fila.filter(p => p.especialidade === especialidadeAtual);
  fila = ordenarFilaRegra(fila);

  const container = document.getElementById('filaContent');

  // Sem pacientes para a especialidade
  if (fila.length === 0) {
    container.innerHTML = '<div class="vazio">📭 Nenhum paciente na fila para sua especialidade.</div>';
    return;
  }

  // Cabeçalho da tabela
  let html = `<table><thead>
    <th>Prioridade</th><th>Paciente</th><th>Gênero</th><th>Especialidade</th>
    <th>Data</th><th>Condições</th><th>Sintomas</th><th>Regra Admin</th><th>Ação</th>
  </thead><tbody>`;

  // Linha por paciente
  fila.forEach(p => {
    const condicoes = (p.condicoes?.length) ? p.condicoes.join(', ') : 'Nenhuma';
    const sintomas  = (p.sintomas?.length)  ? p.sintomas.join(', ')  : 'Nenhum';

    // Trunca as regras do admin se ficarem longas
    let regraTexto = '—';
    if (p.regrasAdminAtendidas?.length) {
      regraTexto = p.regrasAdminAtendidas.join('; ');
      if (regraTexto.length > 60) regraTexto = regraTexto.substring(0, 57) + '...';
    }

    html += `<tr>
      <td><span class="badge-risco ${p.risco}">${p.risco.toUpperCase()}</span></td>
      <td><strong>${p.nome}</strong></td>
      <td>${p.genero || 'Não informado'}</td>
      <td>${p.especialidade || '—'}</td>
      <td>${new Date(p.dataAtendimento).toLocaleDateString('pt-BR')}</td>
      <td class="coluna-texto">${condicoes}</td>
      <td class="coluna-texto">${sintomas}</td>
      <td style="color:#ffaa88;">${regraTexto}</td>
      <td><button class="btn-chamar" onclick="chamarPaciente('${p.cpf}')">✅ Chamar</button></td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

/* =========================================================
   CHAMAR PACIENTE
   Remove da fila e grava em 'pacienteChamado' (a TV escuta isso).
   ========================================================= */
function chamarPaciente(cpf) {
  let fila = Storage.get(Storage.keys.fila, []);
  const idx = fila.findIndex(p => p.cpf === cpf);
  if (idx === -1) { alert('Paciente não encontrado na fila.'); return; }

  const paciente = fila[idx];
  if (!confirm(`Chamar ${paciente.nome} para ${consultorioAtual}?`)) return;

  // Remove da fila
  fila.splice(idx, 1);
  Storage.set(Storage.keys.fila, fila);

  // Publica a chamada (dispara evento 'storage' na aba da TV)
  Storage.set(Storage.keys.chamado, {
    nome: paciente.nome,
    risco: paciente.risco,
    consultorio: consultorioAtual,
    especialidade: especialidadeAtual,
    timestamp: new Date().toISOString()
  });

  carregarFila();
  alert(`✅ Paciente ${paciente.nome} chamado para ${consultorioAtual}!`);
}

/* Logout */
function logout() { Auth.logout(); }

/* ---------- Boot: valida acesso e mantém a fila atualizada ---------- */
verificarAcesso();
carregarFila();
setInterval(carregarFila, 3000); // polling a cada 3s