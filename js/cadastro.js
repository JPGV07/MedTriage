
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastro-form');
  const inputNome = document.getElementById('nome-cadastro');
  const inputCpf = document.getElementById('input-cadastro-id');
  const inputNovaSenha = document.getElementById('nova-senha');
  const inputRepetirSenha = document.getElementById('repetir-senha');
  const inputEmail = document.getElementById('email-cadastro');
  const checkTermos = document.getElementById('termos');
  const toggleButtons = document.querySelectorAll('.toggle-password');

  const API_URL = 'https://triagemapi-production.up.railway.app/users';

  // Verifica se os elementos necessários existem
  if (
    !form || !inputNome || !inputCpf ||
    !inputNovaSenha || !inputRepetirSenha ||
    !inputEmail || !checkTermos
  ) {
    console.error('Erro: um ou mais elementos do formulário não foram encontrados.');
    return;
  }

  // 1. Máscara automática de CPF
  inputCpf.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');

    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    valor = valor
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    e.target.value = valor;
  });

  // 2. Mostrar / ocultar senha
  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;

      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      btn.innerHTML = isPassword
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
             <line x1="1" y1="1" x2="23" y2="23"></line>
           </svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
             <circle cx="12" cy="12" r="3"></circle>
           </svg>`;
    });
  });

  // 3. Validação e envio do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const cpfFormatado = inputCpf.value.trim();
    const cpfNumeros = cpfFormatado.replace(/\D/g, '');
    const senha = inputNovaSenha.value;
    const repetirSenha = inputRepetirSenha.value;
    const email = inputEmail.value.trim();

    // Valida nome completo
    if (nome.split(/\s+/).filter(Boolean).length < 2) {
      alert('Por favor, informe seu nome completo (nome e sobrenome).');
      inputNome.focus();
      return;
    }

    // Valida CPF
    if (cpfNumeros.length !== 11) {
      alert('O CPF precisa ter 11 números.');
      inputCpf.focus();
      return;
    }

    // Valida senha
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      inputNovaSenha.focus();
      return;
    }

    // Confirmação de senha
    if (senha !== repetirSenha) {
      alert('As senhas não coincidem. Digite novamente.');
      inputRepetirSenha.focus();
      return;
    }

    // E-mail obrigatório
    if (!email) {
      alert('O e-mail é obrigatório.');
      inputEmail.focus();
      return;
    }

    // Valida formato do e-mail
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email)) {
      alert('Por favor, informe um endereço de e-mail válido.');
      inputEmail.focus();
      return;
    }

    // Valida termos de uso
    if (!checkTermos.checked) {
      alert('Você precisa aceitar os termos de uso para continuar.');
      checkTermos.focus();
      return;
    }

    // Dados enviados para a API
    const dadosUsuario = {
      nome: nome,
      cpf: cpfFormatado,
      senha: senha,
      login: email,
      role: 'CLIENTE'
    };

    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosUsuario)
      });

      if (resposta.ok) {
        alert('Cadastro realizado com sucesso!');
        window.location.href = 'index.html';
      } else {
        const erroData = await resposta.json().catch(() => ({}));

        const mensagemErro =
          erroData.message ||
          erroData.error ||
          erroData.mensagem ||
          `Erro ao criar acesso (Código ${resposta.status}).`;

        alert(mensagemErro);
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);
      alert('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
  });
});
