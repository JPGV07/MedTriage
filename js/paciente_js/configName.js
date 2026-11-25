(async function carregarNomePaciente() {
  const token = localStorage.getItem('token');
  const cpf = localStorage.getItem('userCpf');

  if (!token || !cpf) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const parametros = new URLSearchParams({ cpf });
    const resposta = await fetch(`https://triagemapi-production.up.railway.app/users/find?${parametros}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (resposta.ok) {
      const conteudo = (await resposta.text()).trim();
      let nomeCompleto = conteudo;

      // A API pode responder com texto puro ou com JSON contendo o nome.
      try {
        const dados = JSON.parse(conteudo);
        if (typeof dados === 'string') {
          nomeCompleto = dados;
        } else if (dados && typeof dados === 'object') {
          nomeCompleto = dados.nome ?? dados.name ?? dados.nomeCompleto ?? dados.fullName ?? '';
        }
      } catch {
        // A resposta já é texto puro.
      }

      nomeCompleto = String(nomeCompleto).trim().replace(/\s+/g, ' ');
      if (!nomeCompleto) {
        console.error('A API respondeu, mas não foi encontrado um nome na resposta:', conteudo);
        return;
      }

      const primeiroNome = nomeCompleto.split(' ')[0];

      // Atualiza os elementos na tela
      const elGreeting = document.getElementById('user-greeting');
      const elTitleName = document.getElementById('patient-name-title');

      if (elGreeting) elGreeting.textContent = `Olá, ${primeiroNome}`;
      if (elTitleName) elTitleName.textContent = `Olá, ${nomeCompleto}`;
    } else {
      console.error(`Erro ao buscar o nome do usuário (HTTP ${resposta.status}).`);
    }
  } catch (erro) {
    console.error('Erro de conexão:', erro);
  }
})();