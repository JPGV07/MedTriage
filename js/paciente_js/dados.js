
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    const cpf = localStorage.getItem('userCpf') || localStorage.getItem('cpf') || '';

    console.log("Token recuperado:", token ? "Presente" : "Ausente");
    console.log("CPF original enviado com pontuação:", cpf);

    if (!token || !cpf) {
        alert("Sessão expirada ou dados de login não encontrados. Faça login novamente.");
        window.location.href = '../index.html';
        return;
    }

    carregarPerfil(cpf, token);

    const form = document.getElementById("form-meus-dados");

    if (form) {
        form.addEventListener("submit", (event) => salvarPerfil(event, token));
    }
});


// --- FUNÇÃO 1: Buscar dados para preencher a tela (GET) ---
async function carregarPerfil(cpf, token) {
    try {
        const resposta = await fetch(
            `https://triagemapi-production.up.railway.app/pac/perfil/find?cpf=${encodeURIComponent(cpf)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!resposta.ok) {
            throw new Error(`Erro ao buscar dados do perfil. Status: ${resposta.status}`);
        }

        const dados = await resposta.json();

        console.log("Dados recebidos do backend:", dados);

        // Preenche os campos
        document.getElementById("dados-nome").value = dados.nome || "";
        document.getElementById("dados-cpf").value = dados.cpf || "";
        document.getElementById("dados-email").value = dados.email || "";
        document.getElementById("dados-telefone").value = dados.telefone || "";
        document.getElementById("dados-nascimento").value = dados.dataNascimento || "";

        // Os valores precisam corresponder aos Enums do Java
        document.getElementById("dados-sexo").value = dados.sexoBiologico || "";
        document.getElementById("dados-genero").value = dados.genero || "";

        document.getElementById("dados-peso").value = dados.peso ?? "";
        document.getElementById("dados-altura").value = dados.altura ?? "";

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}


// --- FUNÇÃO 2: Enviar as alterações para o banco (PUT) ---
async function salvarPerfil(event, token) {
    event.preventDefault();

    const dadosAtualizados = {
        nome: document.getElementById("dados-nome").value,
        cpf: document.getElementById("dados-cpf").value,
        email: document.getElementById("dados-email").value || null,
        telefone: document.getElementById("dados-telefone").value || null,

        dataNascimento: document.getElementById("dados-nascimento").value || null,
        sexoBiologico: document.getElementById("dados-sexo").value || null,
        genero: document.getElementById("dados-genero").value || null,

        // Campos numéricos opcionais
        peso: document.getElementById("dados-peso").value
            ? parseFloat(document.getElementById("dados-peso").value)
            : null,

        altura: document.getElementById("dados-altura").value
            ? parseFloat(document.getElementById("dados-altura").value)
            : null
    };

    console.log("Dados enviados para API:", dadosAtualizados);

    try {
        const resposta = await fetch(
            "https://triagemapi-production.up.railway.app/pac/perfil",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(dadosAtualizados)
            }
        );

        if (resposta.ok) {
    alert("Perfil atualizado com sucesso!");
} else {
    const erro = await resposta.text();

    console.error("Status:", resposta.status);
    console.error("Erro completo:", erro);

    alert(erro);
}

    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro de conexão com o servidor.");
    }
}
