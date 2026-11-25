const API_BASE = 'https://triagemapi-production.up.railway.app';

document.addEventListener('DOMContentLoaded', () => {
  const resetToken = sessionStorage.getItem('@medtriage/reset_token');
  if (!resetToken) { window.location.href = 'password.html'; return; }

  const form = document.getElementById('form-redefinir');
  const inputNova = document.getElementById('nova-senha');
  const inputConf = document.getElementById('confirmar-senha');
  const btnSalvar = document.getElementById('btn-salvar');

  // Toggle senha
  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.input-wrapper');
      const input = wrapper?.querySelector('input');
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const senha = inputNova.value;
    const confirm = inputConf.value;

    if (senha.length < 6) {
      return mostrarAviso('A senha deve ter pelo menos 6 caracteres.', 'error');
    }
    if (senha !== confirm) {
      return mostrarAviso('As senhas não coincidem.', 'error');
    }

    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando…';

    try {
      const resp = await fetch(`${API_BASE}/auth/redefinir-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, novaSenha: senha })
      });

      if (resp.ok) {
        // Limpa tudo
        sessionStorage.removeItem('@medtriage/reset_email');
        sessionStorage.removeItem('@medtriage/reset_token');
        sessionStorage.removeItem('@medtriage/reset_started_at');

        mostrarAviso('Senha alterada com sucesso! Redirecionando…', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        return;
      }

      if (resp.status === 401 || resp.status === 410) {
        mostrarAviso(
          'Sessão expirada. Solicite um novo código.',
          'error'
        );
        setTimeout(() => { window.location.href = 'password.html'; }, 2000);
        return;
      }

      mostrarAviso('Não foi possível salvar. Tente novamente.', 'error');

    } catch (err) {
      console.error('[redefinir_senha]', err);
      mostrarAviso('Erro de conexão. Verifique sua internet.', 'error');
    } finally {
      btnSalvar.disabled = false;
      btnSalvar.textContent = 'Salvar nova senha';
    }
  });

  function mostrarAviso(msg, tipo) {
    const el = document.getElementById('aviso-redefinir');
    const cores = {
      error: { bg: '#FEE2E2', fg: '#DC2626' },
      success: { bg: '#DCFCE7', fg: '#15803D' }
    };
    const c = cores[tipo] || cores.error;
    el.style.display = '';
    el.style.background = c.bg;
    el.style.color = c.fg;
    el.textContent = msg;
  }
});