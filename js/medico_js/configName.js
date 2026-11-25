document.addEventListener("DOMContentLoaded", async () => {
    // 1. Pega o token JWT salvo no localStorage no momento do login
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn("Nenhum token encontrado. Redirecionando para o login...");
        window.location.href = '../index.html';
        return;
    }

    try {
        // 2. Faz a requisição GET para o endpoint protegida pelo token
        const resposta = await fetch("https://triagemapi-production.up.railway.app/func/nome", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (resposta.ok) {
            // Como o back-end retorna apenas a String com o nome
            const nomeUsuario = await resposta.text();
            const nomeExibicao = nomeUsuario || "Doutor(a)";

            // 3. Seleciona os elementos do HTML e substitui o texto
            const userGreeting = document.getElementById("user-greeting");
            const welcomeTitle = document.getElementById("welcome-title");

            if (userGreeting) {
                userGreeting.textContent = `Olá,  ${nomeExibicao}`;
            }
            if (welcomeTitle) {
                welcomeTitle.textContent = `Olá, ${nomeExibicao}`;
            }
        } else {
            console.error("Erro na API ao buscar o nome. Status:", resposta.status);
        }
    } catch (error) {
        console.error("Erro de conexão com o servidor:", error);
    }
});