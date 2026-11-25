document.addEventListener('DOMContentLoaded', () => {
  const btnPaciente = document.getElementById("btn-paciente");
  const btnProfissional = document.getElementById("btn-profissional");
  const labelId = document.getElementById("label-id");
  const inputId = document.getElementById("input-id");
  const inputSenha = document.getElementById("senha"); 
  const loginForm = document.getElementById("login-form");
  const firstTimeBox = document.querySelector(".first-time-box");

  // Referências aos textos da caixa inferior. Elas mudam conforme o perfil.
  const firstTimeText = firstTimeBox ? firstTimeBox.querySelector("p") : null;
  const firstTimeLink = firstTimeBox ? firstTimeBox.querySelector("a") : null;

  let perfilAtivo = "paciente";

  // 1. Alternância entre Paciente e Profissional
  if (btnPaciente && btnProfissional) {
    btnPaciente.addEventListener("click", () => {
      perfilAtivo = "paciente";
      document.body.classList.remove("theme-professional");
      btnPaciente.classList.add("active");
      btnProfissional.classList.remove("active");

      // Ao voltar para paciente, restabelecemos o CPF e o cadastro paciente.
      labelId.textContent = "CPF";
      inputId.placeholder = "000.000.000-00";
      inputId.value = "";

      if (firstTimeBox) {
        firstTimeBox.style.display = "block";
        if (firstTimeText) firstTimeText.textContent = "Primeira vez aqui?";
        if (firstTimeLink) {
          firstTimeLink.textContent = "Criar meu acesso";
          firstTimeLink.href = "cadastro.html";
        }
      }
    });

    btnProfissional.addEventListener("click", () => {
      perfilAtivo = "profissional";
      document.body.classList.add("theme-professional");
      btnProfissional.classList.add("active");
      btnPaciente.classList.remove("active");

      labelId.textContent = "Matrícula";
      inputId.placeholder = "Digite sua matrícula";
      inputId.value = "";

      if (firstTimeBox) {
        // Estado inicial: primeiro acesso do paciente
        firstTimeBox.style.display = "block";
        if (firstTimeText) firstTimeText.textContent = "Primeira vez aqui?";
        if (firstTimeLink) {
          firstTimeLink.textContent = "Cadastrar como médico";
          firstTimeLink.href = "cadastro_medico.html";
        }
      }
    });

    // 2. Máscara dinâmica de CPF ou Matrícula
    inputId.addEventListener("input", function (e) {
      if (perfilAtivo === "profissional") {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        return;
      }

      let valor = e.target.value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.slice(0, 11);

      valor = valor
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      e.target.value = valor;
    });
  }

  // 3. Envio do Login para a API
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); 

      const documentValue = inputId ? inputId.value.trim() : "";
      const senhaVal = inputSenha ? inputSenha.value : "";

      if (!documentValue || !senhaVal) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      const dadosLogin = {
        document: documentValue,
        senha: senhaVal
      };

      try {
        const resposta = await fetch('https://triagemapi-production.up.railway.app/register/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosLogin)
        });

       if (resposta.ok) {
  const resultado = await resposta.json();
  localStorage.setItem('token', resultado.token);
  
  // Salva o CPF/Matrícula que o usuário digitou
  localStorage.setItem('userCpf', documentValue); 

  alert('Login realizado com sucesso!');
  window.location.href = perfilAtivo === 'profissional'
    ? 'tela_medico/medico.html'
    : 'paciente.html';
} else {
          alert('Credenciais inválidas. Verifique seu CPF/Matrícula e senha.');
        }

      } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor.');
      }
    });
  }
});

// 4. Funcionalidade do botão de alternar visualização da senha (o "olho")
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