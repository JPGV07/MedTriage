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

  // 1. Máscara automática de CPF (000.000.000-00)
  inputCpf.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);

    valor = valor
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    e.target.value = valor;
  });

  // 2. Mostrar / Ocultar Senha
  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      btn.innerHTML = isPassword
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
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
    if (nome.split(' ').filter(Boolean).length < 2) {
      alert('Por favor, informe seu nome completo (nome e sobrenome).');
      inputNome.focus();
      return;
    }

    // Valida se tem 11 números
    if (cpfNumeros.length !== 11) {
      alert('O CPF precisa ter 11 números.');
      inputCpf.focus();
      return;
    }

    // Valida tamanho da senha
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      inputNovaSenha.focus();
      return;
    }

    // Valida se as senhas coincidem
    if (senha !== repetirSenha) {
      alert('As senhas não coincidem. Digite novamente.');
      inputRepetirSenha.focus();
      return;
    }

    // Valida e-mail se preenchido
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Por favor, insira um endereço de e-mail válido.');
      inputEmail.focus();
      return;
    }

    // Valida termos de uso
    if (!checkTermos.checked) {
      alert('Você precisa aceitar os termos de uso para continuar.');
      checkTermos.focus();
      return;
    }


    // Monta o objeto com os dados no formato exato que o UsuarioDTO exige
    const dadosUsuario = {
      nome: nome,
      cpf: cpfFormatado, // Agora vai como "000.000.000-00"
      senha: senha,
      login: email || "",
      role: "CLIENTE"
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
        window.location.href = 'index.html';
      } else {
        const erroData = await resposta.json().catch(() => ({}));
        const mensagemErro = erroData.message || erroData.error || erroData.mensagem || `Erro ao criar acesso (Código ${resposta.status}).`;
        alert(mensagemErro);
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);
      alert('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
  });
});