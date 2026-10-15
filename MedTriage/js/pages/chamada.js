/* =========================================================
   CHAMADA.JS — Painel de TV (chamada de pacientes)
   =========================================================
   Escuta mudanças na chave 'pacienteChamado' do Storage.
   Quando um médico chama alguém, o painel mostra o nome,
   prioridade e consultório e depois volta ao estado "aguardando".
   ========================================================= */

function atualizarDisplay() {
  const chamado = Storage.get(Storage.keys.chamado);
  const conteudo = document.getElementById('conteudo');

  /* ---------- Há chamada ativa? ---------- */
  if (chamado && chamado.nome) {
    // Define cor e mensagem conforme o risco
    let corClasse = '', mensagem = '';
    if (chamado.risco === 'vermelho')     { corClasse = 'vermelho-bg'; mensagem = '🔴 ATENÇÃO MÁXIMA!'; }
    else if (chamado.risco === 'amarelo') { corClasse = 'amarelo-bg';  mensagem = '🟡 ATENÇÃO!'; }
    else                                  { corClasse = 'verde-bg';    mensagem = '🟢 ATENÇÃO!'; }

    const consultorio = chamado.consultorio || 'Consultório Médico';

    // Monta o HTML da chamada
    conteudo.innerHTML = `
      <div class="paciente-nome">${chamado.nome}</div>
      <div class="prioridade-badge ${corClasse}">${chamado.risco.toUpperCase()}</div>
      <div class="consultorio-info">🏥 ${consultorio}</div>
      <div class="mensagem-aviso">${mensagem}<br>Dirija-se ao ${consultorio}.</div>`;

    // Efeito visual de pisca por 3 segundos
    document.getElementById('painel').classList.add('chamado');
    setTimeout(() => document.getElementById('painel').classList.remove('chamado'), 3000);

    // Após 10s, limpa a chamada e volta para "aguardando"
    setTimeout(() => {
      if (Storage.get(Storage.keys.chamado)) {
        Storage.remove(Storage.keys.chamado);
        atualizarDisplay();
      }
    }, 10000);

  /* ---------- Sem chamada ativa ---------- */
  } else {
    conteudo.innerHTML = '<div class="aguardando">Aguardando chamada...</div>';
    document.getElementById('painel').classList.remove('chamado');
  }
}

/* ---------- Escuta mudanças feitas em outra aba ---------- */
window.addEventListener('storage', (e) => {
  if (e.key === Storage.keys.chamado) atualizarDisplay();
});

/* ---------- Fallback: polling a cada 2s (para o caso de outra aba) ---------- */
setInterval(atualizarDisplay, 2000);

/* ---------- Boot: primeira renderização ---------- */
atualizarDisplay();
