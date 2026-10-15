/* =========================================================
   LOGIN.JS — Autenticação do médico e do administrador
   =========================================================
   Aceita tanto o nome real (Igor, Eduarda, Wilson, João)
   quanto o usuário técnico (medico, pediatra, geriatra, admin).
   ========================================================= */

function fazerLogin() {
  // Pega o que foi digitado (sem espaços extras)
  let user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('errorMsg');
  errorDiv.style.display = 'none';

  // Valida campos obrigatórios
  if (!user || !pass) {
    errorDiv.innerText = 'Preencha usuário e senha';
    errorDiv.style.display = 'block';
    return;
  }

  // Normaliza o usuário para o "usuário interno"
  let u = user.toLowerCase();
  if (u === 'joão' || u === 'joao') u = 'admin';
  else if (u === 'igor')     u = 'medico';
  else if (u === 'eduarda')  u = 'pediatra';
  else if (u === 'wilson')   u = 'geriatra';

  /* ---------- Caminho 1: ADMIN ---------- */
  if (u === 'admin' && pass === 'admin') {
    Storage.set(Storage.keys.user, {
      tipo: 'admin',
      nome: 'João',
      especialidade: 'Administrador'
    });
    window.location.href = 'admin.html';
    return;
  }

  /* ---------- Caminho 2: MÉDICOS ----------
     Senha padrão dos médicos é "123". */
  if (pass !== '123') {
    errorDiv.innerText = 'Senha incorreta. Use 123 para médicos.';
    errorDiv.style.display = 'block';
    return;
  }

  // Descobre especialidade e nome conforme o usuário
  let especialidade = '', nomeMedico = '';
  if (u === 'medico')        { especialidade = 'Clínica Geral'; nomeMedico = 'Igor'; }
  else if (u === 'pediatra') { especialidade = 'Pediatria';     nomeMedico = 'Eduarda'; }
  else if (u === 'geriatra') { especialidade = 'Geriatria';     nomeMedico = 'Wilson'; }
  else {
    errorDiv.innerText = 'Usuário inválido. Use: Igor, Eduarda, Wilson, João ou medico/pediatra/geriatra/admin';
    errorDiv.style.display = 'block';
    return;
  }

  // Salva sessão e vai para o painel do médico
  Storage.set(Storage.keys.user, { tipo: 'medico', especialidade, nome: nomeMedico });
  window.location.href = 'medico.html';
}

// Atalho: pressionar Enter no campo de senha já faz login
document.getElementById('password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fazerLogin();
});
