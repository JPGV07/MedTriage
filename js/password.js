document.addEventListener('DOMContentLoaded', () => {
  const recuperarForm = document.getElementById('recuperar-form');
  const esqueciSenha = document.getElementById('input-recuperar-id');
  const inputNovaSenha = document.getElementById('nova-senha-recuperar');
  const inputRepetirSenha = document.getElementById('repetir-senha-recuperar');

  // 1. Aplicação da máscara de CPF no input
  if (esqueciSenha) {
    esqueciSenha.addEventListener('input', (e) => {
      let valor = e.target.value;
      valor = valor.replace(/\D/g, "");

      if (valor.length > 3 && valor.length <= 6) {
        valor = valor.replace(/^(\d{3})(\d+)/, "$1.$2");
      } else if (valor.length > 6 && valor.length <= 9) {
        valor = valor.replace(/^(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
      } else if (valor.length > 9) {
        valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
      }

      e.target.value = valor;
    });
  }

  // 2. Manipulação do envio do formulário
  if (recuperarForm) {
    recuperarForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Evita recarregar a página

      // Validação se as senhas coincidem
      if (inputNovaSenha.value !== inputRepetirSenha.value) {
        alert("As senhas não coincidem!");
        return;
      }

      // Validação de tamanho mínimo
      if (inputNovaSenha.value.length < 6) {
        alert("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }

      const cpfData = esqueciSenha.value;
      const novaSenhaData = inputNovaSenha.value;

      // Monta o DTO compatível com o seu backend (@RequestBody UsuarioDTO)
      const dadosAtualizacao = {
        cpf: cpfData,
        senha: novaSenhaData
      };

      try {
        // Faz a requisição PUT para o endpoint do Spring Boot
        const resposta = await fetch('https://triagemapi-production.up.railway.app/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosAtualizacao)
        });

        if (resposta.ok) {
          alert("Senha alterada com sucesso!");
          window.location.href = 'index.html'; // Redireciona de volta para o login
        } else {
          alert("Erro ao alterar a senha. Verifique se o CPF está correto.");
        }
      } catch (erro) {
        console.error("Erro de conexão:", erro);
        alert("Não foi possível conectar ao servidor.");
      }
    });
  }
});


  const botoesToggleSenha = document.querySelectorAll('.toggle-password');

  botoesToggleSenha.forEach(button => {
    button.addEventListener('click', () => {
      // Encontra o input que está dentro do mesmo container (.input-wrapper)
      const inputWrapper = button.closest('.input-wrapper');
      const input = inputWrapper ? inputWrapper.querySelector('input') : null;

      if (input) {
        // Alterna entre 'password' e 'text'
        const tipoAtual = input.getAttribute('type');
        if (tipoAtual === 'password') {
          input.setAttribute('type', 'text');
        } else {
          input.setAttribute('type', 'password');
        }
      }
    });
  });