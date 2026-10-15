/* =========================================================
   AFERICAO.JS — Lógica da tela de aferição (simulação)
   =========================================================
   Simula leitura de pressão e temperatura com animação de
   barra, classifica cada sinal e define o risco final.
   ========================================================= */

/* ---------- Carrega o paciente vindo do cadastro ---------- */
const paciente = Storage.get(Storage.keys.paciente);
if (!paciente) {
  alert('Nenhum paciente cadastrado.');
  window.location.href = 'cadastro.html';
}
document.getElementById('nomePaciente').innerHTML = paciente.nome;

/* ---------- Leituras simuladas (ciclo) ----------
   Cada aferição pega a próxima leitura desta lista. */
const leituras = [
  { sist: 108, diast: 70, temp: 36.4 }, // normal
  { sist: 112, diast: 78, temp: 37.3 }, // limítrofe + febre leve
  { sist: 118, diast: 82, temp: 37.8 }, // alerta + febre leve/moderada
  { sist: 125, diast: 85, temp: 38.2 }, // moderada + febre moderada
  { sist: 135, diast: 88, temp: 38.6 }, // moderado/grave
  { sist: 142, diast: 92, temp: 39.1 }, // grave
  { sist: 128, diast: 86, temp: 37.0 }, // só pressão moderada
  { sist: 110, diast: 80, temp: 38.4 }  // febre moderada, pressão limite
];
let indice = 0; // controla a leitura atual

/* =========================================================
   ANIMAR — preenche a barra de 0% a 100% em N ms.
   Retorna uma Promise para poder usar "await".
   ========================================================= */
function animar(barra, duracao) {
  return new Promise(resolve => {
    barra.style.transition = "none";
    barra.style.width = "0%";
    void barra.offsetWidth; // força reflow para reiniciar a animação
    barra.style.transition = `width ${duracao}ms linear`;
    barra.style.width = "100%";
    setTimeout(resolve, duracao + 100);
  });
}

/* =========================================================
   RESETAR — devolve o totem ao estado inicial
   ========================================================= */
function resetar() {
  document.getElementById("pressaoCard").className = "sensor aguardando";
  document.getElementById("tempCard").className = "sensor aguardando";
  document.getElementById("valorPressao").innerHTML = "— / —";
  document.getElementById("valorTemp").innerHTML = "— °C";
  document.getElementById("msgPressao").innerHTML = "Encaixe o pulso esquerdo no medidor";
  document.getElementById("msgTemp").innerHTML = "Aproxime a testa do sensor infravermelho";
  document.getElementById("resultado").style.display = "none";
  document.getElementById("barraPressao").style.width = "0%";
  document.getElementById("barraTemp").style.width = "0%";
  document.getElementById("wrapPressao").style.display = "none";
  document.getElementById("wrapTemp").style.display = "none";
  document.getElementById("btnTxt").innerHTML = "Iniciar Aferição";
  document.getElementById("btnMain").disabled = false;
}

/* =========================================================
   CLASSIFICAÇÃO DA PRESSÃO
   Retorna { nivel, peso, texto } com base na sistólica/diastólica.
   ========================================================= */
function nivelPressao(sist, diast) {
  if (sist >= 140 || diast >= 90) return { nivel: "grave",    peso: 50, texto: "Pressão arterial grave" };
  if (sist >= 120 || diast >= 85) return { nivel: "moderado", peso: 30, texto: "Pressão arterial moderadamente elevada" };
  if (sist >= 110 || diast >= 80) return { nivel: "alerta",   peso: 15, texto: "Pressão arterial levemente elevada" };
  return { nivel: "normal", peso: 0, texto: "Pressão arterial normal" };
}

/* =========================================================
   CLASSIFICAÇÃO DA TEMPERATURA
   ========================================================= */
function nivelTemperatura(temp) {
  if (temp >= 39.0) return { nivel: "grave",    peso: 50, texto: "Febre alta (≥ 39°C)" };
  if (temp >= 38.0) return { nivel: "moderado", peso: 35, texto: "Febre moderada (38°C - 38.9°C)" };
  if (temp >= 37.2) return { nivel: "alerta",   peso: 20, texto: "Febre leve (37.2°C - 37.9°C)" };
  return { nivel: "normal", peso: 0, texto: "Temperatura normal" };
}

/* =========================================================
   INICIAR — executa a aferição completa
   ========================================================= */
async function iniciar() {
  // Pega a próxima leitura simulada (cicla quando chega ao fim)
  const leitura = leituras[indice % leituras.length];
  indice++;

  const btn = document.getElementById("btnMain");
  btn.disabled = true;
  document.getElementById("btnTxt").innerHTML = '<div class="spin"></div>';

  /* ---------- Medição da pressão ---------- */
  const pressaoCard = document.getElementById("pressaoCard");
  pressaoCard.className = "sensor medindo";
  document.getElementById("msgPressao").innerHTML = "Realizando aferição da pressão arterial...";
  document.getElementById("wrapPressao").style.display = "block";
  await animar(document.getElementById("barraPressao"), 2300);

  const nivPress = nivelPressao(leitura.sist, leitura.diast);
  // Converte nível interno em classe CSS visual
  let classePressao = "ok";
  if (nivPress.nivel === "grave") classePressao = "critico";
  else if (nivPress.nivel === "moderado" || nivPress.nivel === "alerta") classePressao = "alerta";

  pressaoCard.className = `sensor ${classePressao}`;
  document.getElementById("valorPressao").innerHTML = `${leitura.sist}/${leitura.diast}`;
  document.getElementById("msgPressao").innerHTML = nivPress.texto;

  /* ---------- Medição da temperatura ---------- */
  const tempCard = document.getElementById("tempCard");
  tempCard.className = "sensor medindo";
  document.getElementById("msgTemp").innerHTML = "Realizando leitura térmica corporal...";
  document.getElementById("wrapTemp").style.display = "block";
  await animar(document.getElementById("barraTemp"), 2000);

  const nivTemp = nivelTemperatura(leitura.temp);
  let classeTemp = "ok";
  if (nivTemp.nivel === "grave") classeTemp = "critico";
  else if (nivTemp.nivel === "moderado" || nivTemp.nivel === "alerta") classeTemp = "alerta";

  tempCard.className = `sensor ${classeTemp}`;
  document.getElementById("valorTemp").innerHTML = `${leitura.temp.toFixed(1)} °C`;
  document.getElementById("msgTemp").innerHTML = nivTemp.texto;

  /* ---------- Classificação final (pega o pior dos dois) ---------- */
  const ordem = { grave: 3, moderado: 2, alerta: 1, normal: 0 };
  let nivelFinal = "leve";
  if (ordem[nivPress.nivel] >= ordem[nivTemp.nivel]) {
    if (nivPress.nivel === "grave") nivelFinal = "grave";
    else if (nivPress.nivel === "moderado" || nivPress.nivel === "alerta") nivelFinal = "moderado";
  } else {
    if (nivTemp.nivel === "grave") nivelFinal = "grave";
    else if (nivTemp.nivel === "moderado" || nivTemp.nivel === "alerta") nivelFinal = "moderado";
  }
  if (nivPress.nivel === "normal" && nivTemp.nivel === "normal") nivelFinal = "leve";

  /* ---------- Exibe o resultado na tela ---------- */
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.style.display = "flex";
  resultadoDiv.className = `resultado ${nivelFinal}`;

  const ico = document.getElementById("resIco");
  const titulo = document.getElementById("resTitulo");
  const desc = document.getElementById("resDesc");

  if (nivelFinal === "leve") {
    ico.innerHTML = "✅"; titulo.innerHTML = "Baixo Risco Clínico";
    desc.innerHTML = "Sinais vitais estáveis.";
  } else if (nivelFinal === "moderado") {
    ico.innerHTML = "⚠️"; titulo.innerHTML = "Risco Moderado";
    desc.innerHTML = "Alteração significativa em pressão ou temperatura.";
  } else {
    ico.innerHTML = "🚨"; titulo.innerHTML = "Risco Clínico Elevado";
    desc.innerHTML = "Pressão e/ou temperatura em níveis críticos.";
  }

  /* ---------- Persiste os dados da aferição ---------- */
  const afericaoData = {
    pressao: `${leitura.sist}/${leitura.diast}`,
    temperatura: leitura.temp,
    classificacao: nivelFinal,
    pressaoAlta: (leitura.sist >= 110 || leitura.diast >= 80),
    febreAlta: (leitura.temp >= 37.2),
    nivelPressao: nivPress.nivel,
    nivelTemperatura: nivTemp.nivel,
    data: new Date().toISOString()
  };
  Storage.set(Storage.keys.afericao, afericaoData);

  // Reativa o botão para nova aferição
  document.getElementById("btnTxt").innerHTML = "Nova Aferição";
  btn.disabled = false;
}

/* ---------- Navegação ---------- */
function voltarCadastro() { window.location.href = 'cadastro.html'; }

function avancarTriagem() {
  // Só avança se a aferição já tiver sido feita
  if (!Storage.get(Storage.keys.afericao)) {
    alert('Realize a aferição antes de continuar.');
    return;
  }
  window.location.href = 'triagem.html';
}
