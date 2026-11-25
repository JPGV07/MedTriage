const API_URL = "https://triagemapi-production.up.railway.app";

const selectEspecialidade = document.getElementById("filtro-especialidade");
const selectCidade = document.getElementById("filtro-cidade");
const btnBuscar = document.getElementById("btn-buscar");
const listaMedicos = document.getElementById("lista-medicos");
const tituloResultados = document.getElementById("titulo-resultados");

const nomesEspecialidade = {};
Array.from(selectEspecialidade.options).forEach((opt) => {
    nomesEspecialidade[opt.value] = opt.textContent.trim();
});

function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function buscarMedicos() {
    const especialidade = selectEspecialidade.value;
    const cidade = selectCidade.value;

    // "Todas" não é enviada: sem o parâmetro, o back-end devolve todas as especialidades
    const params = new URLSearchParams();
    if (especialidade !== "Todas") params.append("especialidade", especialidade);
    if (cidade) params.append("cidade", cidade);

    btnBuscar.disabled = true;
    listaMedicos.innerHTML = "<p>Buscando médicos...</p>";

    try {
        const resposta = await fetch(`${API_URL}/med/buscar?${params.toString()}`);

        if (!resposta.ok) {
            listaMedicos.innerHTML = "";
            alert("Erro ao buscar médicos.");
            return;
        }

        const medicos = await resposta.json();
        renderizarMedicos(medicos);
    } catch (error) {
        console.error("Erro de conexão:", error);
        listaMedicos.innerHTML = "";
        alert("Erro de conexão com o servidor.");
    } finally {
        btnBuscar.disabled = false;
    }
}

function renderizarMedicos(medicos) {
    listaMedicos.innerHTML = "";
    tituloResultados.textContent = `Médicos encontrados (${medicos.length})`;

    if (medicos.length === 0) {
        listaMedicos.innerHTML = "<p>Nenhum médico encontrado para essa busca.</p>";
        return;
    }

    medicos.forEach((m) => {
        const card = document.createElement("div");
        card.className = "doctor-card"; // troque se o seu CSS usar outro nome de classe
        card.innerHTML = `
            <h3>${escapar(m.nome)}</h3>
            <p>${escapar(nomesEspecialidade[m.especialidade] || m.especialidade)} · ${escapar(m.cidade)}</p>
            <p>${escapar(m.bairro)}, ${escapar(m.rua)}</p>
            <p>${escapar(m.apresentacao)}</p>
            <p><strong>${formatarPreco(m.precoConsulta)}</strong></p>
        `;
        listaMedicos.appendChild(card);
    });
}

btnBuscar.addEventListener("click", buscarMedicos);

buscarMedicos();