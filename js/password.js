const API_BASE = 'https://triagemapi-production.up.railway.app';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recuperar-form');
  const inputEmail = document.getElementById('input-recuperar-email');
  const btnEnviar = document.getElementById('btn-enviar');
  const aviso = document.getElementById('aviso-recuperar');

  if (!form) return;

  // Foco automático no e-mail ao abrir
  setTimeout(() => inputEmail?.focus(), 100);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (inputEmail.value || '').trim().toLowerCase();

    // --- Validação local ---
    if (!email) {
      return mostrarAviso('Informe seu e-mail cadastrado.', 'error');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return mostrarAviso('Formato de e-mail inválido. Ex.: nome@exemplo.com', 'error');
    }

    // --- Estado de envio ---
    btnEnviar.disabled = true;
    const textoOriginal = btnEnviar.textContent;
    btnEnviar.textContent = 'Enviando…';

    try {
      const resp = await fetch(`${API_BASE}/auth/recuperar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      // ⚠️ Backend SEMPRE responde 200 (mesmo se e-mail não existe)
      //    pra não vazar quais e-mails estão cadastrados.
      if (resp.ok) {
        sessionStorage.setItem('@medtriage/reset_email', email);
        sessionStorage.setItem('@medtriage/reset_started_at', String(Date.now()));
        window.location.href = 'verificar_codigo.html';
        return;
      }

      if (resp.status === 429) {
        const data = await resp.json().catch(() => ({}));
        mostrarAviso(
          data.message || 'Muitas solicitações. Aguarde alguns minutos.',
          'error'
        );
        return;
      }

      // 400 — e-mail inválido (backend também validou)
      if (resp.status === 400) {
        const data = await resp.json().catch(() => ({}));
        mostrarAviso(
          data.message || 'E-mail inválido. Verifique e tente novamente.',
          'error'
        );
        return;
      }

      mostrarAviso(
        'Não foi possível enviar o código. Tente novamente em instantes.',
        'error'
      );

    } catch (err) {
      console.error('[password] erro de conexão:', err);
      mostrarAviso(
        'Erro de conexão. Verifique sua internet e tente novamente.',
        'error'
      );
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.textContent = textoOriginal;
    }
  });

  function mostrarAviso(msg, tipo) {
    if (!aviso) return;

    const cores = {
      error:   { bg: '#FEE2E2', fg: '#B91C1C' },
      success: { bg: '#DCFCE7', fg: '#15803D' },
      info:    { bg: '#E0F2FE', fg: '#075985' }
    };
    const c = cores[tipo] || cores.info;

    aviso.style.display = '';
    aviso.style.background = c.bg;
    aviso.style.color = c.fg;
    aviso.textContent = msg;
    aviso.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});