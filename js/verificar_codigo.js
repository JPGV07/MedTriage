const API_BASE = 'https://triagemapi-production.up.railway.app';

document.addEventListener('DOMContentLoaded', () => {
  const email = sessionStorage.getItem('@medtriage/reset_email');
  if (!email) { window.location.href = 'password.html'; return; }

  const input = document.getElementById('input-codigo');
  const form = document.getElementById('form-codigo');
  const btnValidar = document.getElementById('btn-validar');
  const btnReenviar = document.getElementById('btn-reenviar');
  const contador = document.getElementById('contador-reenvio');

  // Mostra e-mail no subtítulo (parcial)
  document.getElementById('subtitulo-codigo').textContent =
    `Enviamos um código de 6 dígitos para ${mascararEmail(email)}.`;

  // Só números no input
  input.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
  });

  // Cooldown do reenvio
  let cooldown = 60;
  const tick = setInterval(() => {
    cooldown--;
    if (cooldown <= 0) {
      clearInterval(tick);
      btnReenviar.disabled = false;
      btnReenviar.textContent = 'Reenviar código';
    } else {
      contador.textContent = cooldown;
    }
  }, 1000);

  // Submit do código
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = (input.value || '').trim();

    if (!/^\d{6}$/.test(codigo)) {
      return mostrarAviso('O código deve ter 6 dígitos.', 'error');
    }

    btnValidar.disabled = true;
    btnValidar.textContent = 'Verificando…';

    try {
      const resp = await fetch(`${API_BASE}/auth/validar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
      });

      if (resp.ok) {
        const data = await resp.json();
        // { resetToken: "..." } — token de curta duração (15 min)
        sessionStorage.setItem('@medtriage/reset_token', data.resetToken);
        window.location.href = 'redefinir_senha.html';
        return;
      }

      if (resp.status === 429) {
        mostrarAviso(
          'Muitas tentativas incorretas. Solicite um novo código.',
          'error'
        );
        btnValidar.disabled = true;
        input.disabled = true;
        return;
      }

      mostrarAviso('Código inválido ou expirado.', 'error');

    } catch (err) {
      console.error('[verificar_codigo]', err);
      mostrarAviso('Erro de conexão. Tente novamente.', 'error');
    } finally {
      btnValidar.disabled = false;
      btnValidar.textContent = 'Validar código';
    }
  });

  // Reenviar
  btnReenviar.addEventListener('click', async () => {
    btnReenviar.disabled = true;
    btnReenviar.textContent = 'Enviando…';

    try {
      const resp = await fetch(`${API_BASE}/auth/recuperar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (resp.ok) {
        mostrarAviso('Novo código enviado.', 'success');
        cooldown = 60;
        contador.textContent = cooldown;
        // Restart cooldown visual
        let c = 60;
        btnReenviar.disabled = true;
        const t = setInterval(() => {
          c--;
          if (c <= 0) {
            clearInterval(t);
            btnReenviar.disabled = false;
            btnReenviar.textContent = 'Reenviar código';
          } else {
            contador.textContent = c;
          }
        }, 1000);
      } else if (resp.status === 429) {
        mostrarAviso('Aguarde antes de pedir um novo código.', 'error');
        btnReenviar.disabled = false;
        btnReenviar.textContent = 'Reenviar código';
      }
    } catch (err) {
      mostrarAviso('Erro de conexão.', 'error');
      btnReenviar.disabled = false;
      btnReenviar.textContent = 'Reenviar código';
    }
  });

  function mostrarAviso(msg, tipo) {
    const el = document.getElementById('aviso-codigo');
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

  function mascararEmail(e) {
    const [user, domain] = e.split('@');
    const visivel = user.slice(0, 2);
    return `${visivel}${'*'.repeat(Math.max(2, user.length - 2))}@${domain}`;
  }
});