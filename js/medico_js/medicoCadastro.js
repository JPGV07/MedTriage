document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://triagemapi-production.up.railway.app";

    const form = document.getElementById("cadastro-medico-form");
    const inputCpf = document.getElementById("medico-cpf");
    const inputTelefone = document.getElementById("medico-telefone");
    const inputMatricula = document.getElementById("medico-matricula");

    // ---------- Estilo das mensagens de erro (pode mover para o style.css) ----------
    const estilo = document.createElement("style");
    estilo.textContent = `
        .field-error { display: block; color: #c62828; font-size: 0.8rem; margin-top: 4px; }
        .input-invalid { border-color: #c62828 !important; }
    `;
    document.head.appendChild(estilo);

    // ---------- Máscaras ----------
    if (inputCpf) {
        inputCpf.addEventListener("input", (e) => {
            let valor = e.target.value.replace(/\D/g, "").substring(0, 11);

            if (valor.length > 9) {
                valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*$/, "$1.$2.$3-$4");
            } else if (valor.length > 6) {
                valor = valor.replace(/^(\d{3})(\d{3})(\d{0,3}).*$/, "$1.$2.$3");
            } else if (valor.length > 3) {
                valor = valor.replace(/^(\d{3})(\d{0,3}).*$/, "$1.$2");
            }

            e.target.value = valor;
        });
    }

    function formatarTelefone(digitos, apagando) {
        const d = digitos.substring(0, 11);

        if (d.length === 0) return "";
        if (d.length < 2) return `(${d}`;

        const ddd = d.substring(0, 2);
        const resto = d.substring(2);

        if (resto.length === 0) return apagando ? `(${ddd}` : `(${ddd}) `;
        if (resto.length < 5) return `(${ddd}) ${resto}`;
        if (resto.length === 5) return apagando ? `(${ddd}) ${resto}` : `(${ddd}) ${resto}-`;

        return `(${ddd}) ${resto.substring(0, 5)}-${resto.substring(5)}`;
    }

    if (inputTelefone) {
        inputTelefone.addEventListener("input", (e) => {
            const apagando = e.inputType && e.inputType.startsWith("delete");
            const digitos = e.target.value.replace(/\D/g, "");
            e.target.value = formatarTelefone(digitos, apagando);
        });
    }

    // Matrícula sempre em maiúsculas
    if (inputMatricula) {
        inputMatricula.addEventListener("input", (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Mostrar / esconder senha (botão do olho)
    document.querySelectorAll(".toggle-password").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = btn.closest(".input-wrapper").querySelector("input");
            input.type = input.type === "password" ? "text" : "password";
        });
    });

    // ---------- Regras: cada campo devolve a sua mensagem de erro ("" = ok) ----------
    const validadores = {
        "medico-nome": (v) => {
            if (!v) return "Informe o nome completo.";
            if (v.split(/\s+/).length < 2) return "Informe nome e sobrenome.";
            return "";
        },

        "medico-cpf": (v) => {
            const digitos = v.replace(/\D/g, "");
            if (!digitos) return "Informe o CPF.";
            if (digitos.length < 11) return "CPF incompleto. Digite os 11 números.";
            return "";
        },

        "medico-matricula": (v) => {
            if (!v) return "Informe a matrícula.";
            if (!v.toUpperCase().startsWith("MED")) return 'A matrícula deve começar com "MED". Ex: MED5001';
            if (v.length < 4) return "Informe o número depois de MED. Ex: MED5001";
            return "";
        },

        "medico-crm": (v) => {
            if (!v) return "Informe o CRM.";
            if (v.length < 4) return "CRM muito curto. Ex: CRM-PB 00000";
            return "";
        },

        "medico-especialidade": (v) => {
            if (!v) return "Selecione uma especialidade.";
            return "";
        },

        "medico-email": (v) => {
            // opcional
            if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "E-mail inválido. Ex: nome@exemplo.com";
            return "";
        },

        "medico-telefone": (v) => {
            // opcional
            const digitos = v.replace(/\D/g, "");
            if (digitos.length > 0 && digitos.length !== 11) {
                return "Telefone incompleto. Informe DDD + 9 dígitos. Ex: (88) 91111-2222";
            }
            return "";
        },

        "medico-cidade": (v) => {
            if (!v) return "Selecione a cidade.";
            return "";
        },

        "medico-bairro": (v) => {
            if (!v) return "Informe o bairro.";
            return "";
        },

        "medico-rua": (v) => {
            if (!v) return "Informe a rua / endereço completo.";
            return "";
        },

        "medico-preco": (v) => {
            if (!v) return "Informe o preço da consulta.";
            if (!/^\d+([.,]\d{1,2})?$/.test(v)) return "Preço inválido. Use apenas números. Ex: 250,00";
            if (parseFloat(v.replace(",", ".")) <= 0) return "O preço deve ser maior que zero.";
            return "";
        },

        "medico-senha": (v) => {
            if (!v) return "Crie uma senha.";
            if (v.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
            return "";
        },

        "medico-repetir-senha": (v) => {
            if (!v) return "Repita a senha.";
            if (v !== document.getElementById("medico-senha").value) return "As senhas não coincidem.";
            return "";
        }
    };

    // Senhas não podem ter espaços cortados; o resto é lido sem espaços nas pontas
    function valorDe(id) {
        const valor = document.getElementById(id).value;
        return id === "medico-senha" || id === "medico-repetir-senha" ? valor : valor.trim();
    }

    // ---------- Mostrar / limpar erro embaixo de cada campo ----------
    function mostrarErro(id, mensagem) {
        const campo = document.getElementById(id);
        const grupo = campo.closest(".input-group");

        let span = grupo.querySelector(`.field-error[data-campo="${id}"]`);
        if (!span) {
            span = document.createElement("span");
            span.className = "field-error";
            span.dataset.campo = id;
            span.setAttribute("role", "alert");
            grupo.appendChild(span);
        }

        span.textContent = mensagem;
        campo.classList.add("input-invalid");
    }

    function limparErro(id) {
        const campo = document.getElementById(id);
        const grupo = campo.closest(".input-group");
        const span = grupo.querySelector(`.field-error[data-campo="${id}"]`);

        if (span) span.remove();
        campo.classList.remove("input-invalid");
    }

    function validarCampo(id) {
        const mensagem = validadores[id](valorDe(id));

        if (mensagem) {
            mostrarErro(id, mensagem);
            return false;
        }

        limparErro(id);
        return true;
    }

    // Some o erro quando a pessoa corrige; valida ao sair do campo (se tiver algo digitado)
    Object.keys(validadores).forEach((id) => {
        const campo = document.getElementById(id);
        if (!campo) return;

        const aoMudar = () => {
            limparErro(id);

            // Se mudou a senha e a repetição já foi digitada, revalida a repetição
            if (id === "medico-senha" && document.getElementById("medico-repetir-senha").value) {
                validarCampo("medico-repetir-senha");
            }
        };

        campo.addEventListener("input", aoMudar);
        campo.addEventListener("change", aoMudar);
        campo.addEventListener("blur", () => {
            if (campo.value.trim() !== "") validarCampo(id);
        });
    });

    // ---------- Erros que vêm do servidor: mostra no campo certo ----------
    function campoDoErroDoServidor(mensagem) {
        const m = mensagem.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (m.includes("cpf")) return "medico-cpf";
        if (m.includes("crm")) return "medico-crm";
        if (m.includes("matricula")) return "medico-matricula";
        if (m.includes("telefone")) return "medico-telefone";
        if (m.includes("e-mail") || m.includes("email")) return "medico-email";
        return null;
    }

    // ---------- Envio ----------
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Valida todos os campos e guarda o primeiro com erro
            let primeiroInvalido = null;
            Object.keys(validadores).forEach((id) => {
                if (!validarCampo(id) && !primeiroInvalido) primeiroInvalido = id;
            });

            if (primeiroInvalido) {
                document.getElementById(primeiroInvalido).focus();
                return;
            }

            const novoMedico = {
                nome: valorDe("medico-nome"),
                cpf: inputCpf.value,
                matricula: valorDe("medico-matricula").toUpperCase(),
                crm: valorDe("medico-crm"),
                especialidade: valorDe("medico-especialidade"),
                email: valorDe("medico-email"),
                telefone: valorDe("medico-telefone"),
                cidade: valorDe("medico-cidade"),
                bairro: valorDe("medico-bairro"),
                rua: valorDe("medico-rua"),
                precoConsulta: parseFloat(valorDe("medico-preco").replace(",", ".")),
                apresentacao: valorDe("medico-bio"),
                senha: document.getElementById("medico-senha").value,
                role: "FUNCIONARIO",
                profissao: "MEDICO"
            };

            const botao = form.querySelector('button[type="submit"]');
            if (botao) botao.disabled = true;

            try {
                const resposta = await fetch(`${API_URL}/med`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(novoMedico)
                });

                if (resposta.ok) {
                    window.location.href = "../index.html";
                    return;
                }

                // Lê a mensagem que o back-end devolveu
                let mensagem = "Erro ao realizar o cadastro.";
                try {
                    const texto = await resposta.text();
                    if (texto) {
                        try {
                            const json = JSON.parse(texto);
                            mensagem = json.message || json.mensagem || json.error || texto;
                        } catch {
                            mensagem = texto;
                        }
                    }
                } catch {
                    // mantém a mensagem padrão
                }

                // Se a mensagem fala de um campo, mostra embaixo dele; senão, alerta geral
                const campo = campoDoErroDoServidor(mensagem);
                if (campo) {
                    // Erro vindo do banco/servidor citando o CPF: mensagem clara em vez do texto técnico
                    if (campo === "medico-cpf") {
                        mensagem = "Não foi possível cadastrar com este CPF. Ele já pode estar cadastrado ou ser inválido.";
                    }
                    mostrarErro(campo, mensagem);
                    document.getElementById(campo).focus();
                } else {
                    alert(mensagem);
                }
            } catch (error) {
                console.error("Erro de conexão:", error);
                alert("Erro de conexão com o servidor.");
            } finally {
                if (botao) botao.disabled = false;
            }
        });
    }
});