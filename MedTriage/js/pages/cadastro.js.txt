/* =========================================================
   CADASTRO.JS — Lógica do formulário de cadastro
   =========================================================
   Responsável por:
     - Máscara e validação de telefone
     - Seleção visual de faixa etária
     - Trava condicional do checkbox "Gravidez"
     - Máscara de CPF e regra "estrangeiro"
     - Coleta de dados e salvamento no localStorage
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1) TELEFONE — máscara (DD)XXXXXXXX + validação
     ========================================================= */
  const telefoneInput = document.getElementById('telefone');
  const telefoneErro  = document.getElementById('telefoneErro');

  // A cada digitação: limpa não-dígitos, formata e valida
  telefoneInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 10); // só números, máx 10
    if (v.length >= 2) v = '(' + v.substring(0, 2) + ')' + v.substring(2);
    e.target.value = v;
    validarTelefone();
  });

  // Valida o formato final: (83)12345678
  function validarTelefone() {
    const t = telefoneInput.value;
    const regex = /^\(\d{2}\)\d{8}$/; // DDD + 8 dígitos

    if (t === '') { telefoneErro.style.display = 'none'; return false; }

    if (!regex.test(t)) {
      telefoneErro.style.display = 'block';
      telefoneInput.style.borderColor = '#ff4d4d';
      return false;
    }
    telefoneErro.style.display = 'none';
    telefoneInput.style.borderColor = '';
    return true;
  }

  /* =========================================================
     2) FAIXA ETÁRIA — clicar num card define especialidade
     ========================================================= */
  const cards = document.querySelectorAll('.idade-card');
  cards.forEach(card => card.addEventListener('click', () => {
    // Remove "selected" de todos e adiciona no clicado
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    // Preenche os inputs escondidos com os data-attributes do card
    document.getElementById('faixaEtaria').value   = card.dataset.faixa;
    document.getElementById('especialidade').value = card.dataset.especialidade;
  }));

  /* =========================================================
     3) TRAVA DE GRAVIDEZ
     Se o gênero for "Masculino" ou "Mulher Trans",
     o checkbox de Gravidez é desabilitado automaticamente.
     ========================================================= */
  const generoRadios = document.querySelectorAll('input[name="genero"]');
  const gravidezCheckbox = document.querySelector('.condicao[value="Gravidez"]');
  const gravidezLabel = gravidezCheckbox.closest('label');

  function atualizarTravaGravidez() {
    // Descobre qual gênero está selecionado
    let genero = null;
    for (const r of generoRadios) if (r.checked) { genero = r.value; break; }

    // Nenhum selecionado: deixa habilitado
    if (!genero) {
      gravidezCheckbox.disabled = false;
      gravidezLabel.classList.remove('disabled');
      return;
    }

    // Gêneros sem possibilidade de gravidez: desabilita e desmarca
    if (genero === 'Masculino' || genero === 'Mulher Trans') {
      gravidezCheckbox.disabled = true;
      gravidezCheckbox.checked  = false;
      gravidezLabel.classList.add('disabled');
    } else {
      gravidezCheckbox.disabled = false;
      gravidezLabel.classList.remove('disabled');
    }
  }

  // Ao mudar gênero: atualiza visual dos labels + trava gravidez
  generoRadios.forEach(radio => radio.addEventListener('change', function() {
    document.querySelectorAll('#generoOpcoes label').forEach(l => l.classList.remove('selected'));
    if (this.checked) this.parentElement.classList.add('selected');
    atualizarTravaGravidez();
  }));
  atualizarTravaGravidez(); // roda uma vez no carregamento

  /* =========================================================
     4) CPF + ESTRANGEIRO
     Estrangeiro desativa a obrigatoriedade do CPF.
     ========================================================= */
  const cpfInput = document.getElementById('cpf');
  const estrangeiroCheck = document.getElementById('estrangeiro');

  function toggleCpfRequired() {
    if (estrangeiroCheck.checked) {
      cpfInput.removeAttribute('required');
      cpfInput.placeholder = 'CPF opcional';
    } else {
      cpfInput.setAttribute('required', 'required');
      cpfInput.placeholder = '000.000.000-00';
    }
  }
  estrangeiroCheck.addEventListener('change', toggleCpfRequired);
  toggleCpfRequired();

  // Máscara progressiva do CPF: 000.000.000-00
  cpfInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 3) v = v.replace(/^(\d{3})(\d)/, '$1.$2');
    if (v.length > 6) v = v.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    if (v.length > 9) v = v.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    e.target.value = v.substring(0, 14);
  });

  /* =========================================================
     5) SUBMISSÃO DO FORMULÁRIO
     Valida tudo, monta o objeto "paciente" e salva no Storage.
     ========================================================= */
  document.getElementById('cadastroForm').addEventListener('submit', (e) => {
    e.preventDefault(); // impede recarregamento

    // Coleta campos obrigatórios
    const nome          = document.getElementById('nome').value.trim();
    const faixa         = document.getElementById('faixaEtaria').value;
    const especialidade = document.getElementById('especialidade').value;

    if (!nome || !faixa) { alert('Preencha nome e selecione a faixa etária.'); return; }

    const generoSel = document.querySelector('input[name="genero"]:checked');
    if (!generoSel) { alert('Selecione o gênero.'); return; }

    const genero      = generoSel.value;
    const telefone    = document.getElementById('telefone').value;
    const cpf         = document.getElementById('cpf').value;
    const estrangeiro = estrangeiroCheck.checked;

    if (!estrangeiro && !cpf) { alert('CPF é obrigatório para brasileiros.'); return; }

    // Coleta condições marcadas + soma os pesos (usados na triagem)
    const condicoes = [];
    let pesoCondicoes = 0;
    document.querySelectorAll('.condicao:checked').forEach(cb => {
      condicoes.push(cb.value);
      pesoCondicoes += parseInt(cb.dataset.peso, 10);
    });

    // Monta objeto final do paciente
    const paciente = {
      nome,
      faixaEtaria: faixa,
      especialidade,
      genero,
      condicoes,
      pesoCondicoes,
      telefone,
      cpf: estrangeiro ? (cpf || 'Estrangeiro') : cpf,
      email: document.getElementById('email').value,
      estrangeiro,
      dataCadastro: new Date().toISOString()
    };

    // Salva via core.js e avança para a aferição
    Storage.set(Storage.keys.paciente, paciente);
    window.location.href = 'afericao.html';
  });
});