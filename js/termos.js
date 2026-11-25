(() => {
    "use strict";
  
    const VERSAO_TERMOS = "1.0";
    const CHAVE_ACEITES = "@medtriage/aceites-termos";
  
    const TERMOS = {
      paciente: {
        titulo: "Termos de Uso — Paciente",
        conteudo: `
          <h3>1. Apresentação</h3>
          <p>
            Bem-vindo ao MedTriage. Estes termos estabelecem as condições
            de utilização da plataforma por pacientes. Ao aceitar, você
            declara que leu e compreendeu as regras descritas neste documento.
          </p>
  
          <h3>2. Objetivo da plataforma</h3>
          <p>
            O MedTriage tem como objetivo facilitar o acesso a informações,
            serviços de triagem, organização de atendimentos e comunicação
            entre pacientes e profissionais de saúde, conforme os recursos
            efetivamente disponibilizados.
          </p>
          <p>
            A plataforma não substitui consultas médicas, exames, diagnósticos
            ou atendimentos de emergência.
          </p>
  
          <h3>3. Cadastro e informações pessoais</h3>
          <p>
            O paciente deve fornecer informações verdadeiras, completas e
            atualizadas. É responsabilidade do usuário manter seus dados
            cadastrais corretos e comunicar alterações relevantes.
          </p>
          <p>
            O usuário deve proteger suas credenciais de acesso e não
            compartilhar sua senha com terceiros.
          </p>
  
          <h3>4. Informações de saúde</h3>
          <p>
            As informações de saúde fornecidas devem ser verdadeiras e
            atualizadas. O paciente deve informar, quando solicitado,
            alergias, medicamentos utilizados, sintomas e condições
            relevantes para o atendimento.
          </p>
          <p>
            Informações incorretas ou incompletas podem prejudicar a
            qualidade da orientação ou do atendimento.
          </p>
  
          <h3>5. Triagem e atendimentos</h3>
          <p>
            Os recursos de triagem têm finalidade de apoio e organização
            das informações. Uma classificação ou sugestão apresentada
            pela plataforma não representa diagnóstico médico definitivo.
          </p>
          <p>
            Em situações de emergência, procure imediatamente um serviço
            de urgência ou emergência. Não aguarde uma resposta da plataforma.
          </p>
  
          <h3>6. Profissionais de saúde</h3>
          <p>
            Quando a plataforma disponibilizar contato com profissionais,
            o paciente deverá fornecer informações adequadas para a
            realização do atendimento.
          </p>
          <p>
            A avaliação clínica e as decisões médicas são de responsabilidade
            do profissional habilitado, dentro dos limites de sua atuação.
          </p>
  
          <h3>7. Privacidade e proteção de dados</h3>
          <p>
            O tratamento de dados pessoais deverá observar a legislação
            aplicável, especialmente a Lei Geral de Proteção de Dados
            Pessoais (Lei nº 13.709/2018).
          </p>
          <p>
            Dados pessoais e informações de saúde deverão ser utilizados
            somente para finalidades legítimas, informadas e compatíveis
            com os serviços oferecidos, respeitadas as bases legais
            aplicáveis.
          </p>
          <p>
            O usuário poderá exercer os direitos previstos na legislação
            de proteção de dados pelos canais oficiais que deverão ser
            informados pelo responsável pela plataforma.
          </p>
  
          <h3>8. Responsabilidades do usuário</h3>
          <p>
            O usuário compromete-se a utilizar a plataforma de maneira
            lícita, respeitosa e adequada, sem tentar acessar contas de
            terceiros, prejudicar sistemas ou fornecer informações falsas.
          </p>
  
          <h3>9. Limitações do serviço</h3>
          <p>
            A disponibilidade dos recursos poderá sofrer interrupções
            para manutenção, atualização ou correção de falhas.
            O MedTriage deverá informar alterações relevantes nos serviços
            sempre que possível.
          </p>
  
          <h3>10. Alterações dos termos</h3>
          <p>
            Estes termos poderão ser atualizados para refletir mudanças
            nos serviços ou na legislação. Quando uma alteração exigir
            novo consentimento, será solicitada nova aceitação ao usuário.
          </p>
  
          <h3>11. Contato</h3>
          <p>
            Dúvidas, solicitações e questões relacionadas à privacidade
            deverão ser encaminhadas aos canais oficiais do MedTriage,
            que precisam ser informados pelo responsável pela plataforma.
          </p>
  
          <h3>12. Declaração de aceite</h3>
          <p>
            Ao selecionar a opção de aceitação, o paciente declara que
            teve acesso ao conteúdo destes termos, que pôde realizar
            sua leitura e que concorda com as condições aqui descritas.
          </p>
        `
      },
  
      profissional: {
        titulo: "Termos de Uso — Profissional de Saúde",
        conteudo: `
          <h3>1. Apresentação</h3>
          <p>
            Estes termos estabelecem as condições de utilização do MedTriage
            por médicos e profissionais de saúde cadastrados na plataforma.
          </p>
  
          <h3>2. Cadastro profissional</h3>
          <p>
            O profissional deverá fornecer nome completo, matrícula,
            CRM, especialidade e demais informações solicitadas.
            Os dados deverão ser verdadeiros, atualizados e verificáveis.
          </p>
          <p>
            O cadastro na plataforma não substitui a inscrição regular
            no conselho profissional competente nem representa, por si só,
            validação oficial das credenciais informadas.
          </p>
  
          <h3>3. Regularidade profissional</h3>
          <p>
            O profissional declara que possui habilitação legal para
            exercer as atividades que divulgar na plataforma e que
            manterá sua inscrição profissional regular.
          </p>
          <p>
            O uso de especialidades, títulos e qualificações deverá
            respeitar as regras aplicáveis dos respectivos conselhos.
          </p>
  
          <h3>4. Responsabilidade pelo atendimento</h3>
          <p>
            O profissional é responsável pelos atos técnicos que realizar,
            pelas avaliações clínicas, orientações, prescrições e decisões
            tomadas no exercício de sua atividade.
          </p>
          <p>
            A plataforma não substitui o julgamento clínico do profissional.
            Recursos automatizados de triagem devem ser utilizados como
            apoio, e não como substitutos da avaliação médica.
          </p>
  
          <h3>5. Atendimento e comunicação</h3>
          <p>
            O profissional compromete-se a utilizar os canais disponibilizados
            de forma ética, respeitosa e compatível com as normas de sua
            profissão.
          </p>
          <p>
            O atendimento remoto deverá observar os requisitos legais,
            técnicos e éticos aplicáveis à modalidade de atendimento.
          </p>
  
          <h3>6. Sigilo profissional</h3>
          <p>
            O profissional deverá preservar o sigilo das informações
            dos pacientes, observando as normas éticas e legais aplicáveis.
          </p>
          <p>
            O acesso a dados deverá ocorrer somente quando necessário
            para a finalidade legítima do atendimento ou outra hipótese
            legalmente autorizada.
          </p>
  
          <h3>7. Proteção de dados pessoais</h3>
          <p>
            O tratamento de dados pessoais deverá observar a Lei Geral
            de Proteção de Dados Pessoais (Lei nº 13.709/2018), além das
            demais normas aplicáveis.
          </p>
          <p>
            O profissional deverá adotar cuidados para impedir divulgação,
            compartilhamento ou acesso não autorizado a informações
            pessoais e dados sensíveis dos pacientes.
          </p>
  
          <h3>8. Informações do perfil</h3>
          <p>
            O profissional é responsável pela veracidade das informações
            de seu perfil, incluindo especialidade, apresentação,
            localização e valores informados.
          </p>
          <p>
            Alterações relevantes deverão ser atualizadas na plataforma
            para evitar informações incorretas aos pacientes.
          </p>
  
          <h3>9. Uso adequado da plataforma</h3>
          <p>
            É proibido utilizar o MedTriage para divulgar informações
            falsas, realizar práticas ilícitas, acessar dados sem
            autorização ou comprometer a segurança do sistema.
          </p>
  
          <h3>10. Disponibilidade dos serviços</h3>
          <p>
            A plataforma poderá passar por manutenções, atualizações
            e interrupções técnicas. O MedTriage buscará manter seus
            recursos disponíveis, sem garantir funcionamento ininterrupto.
          </p>
  
          <h3>11. Suspensão e encerramento</h3>
          <p>
            O acesso poderá ser suspenso ou encerrado em situações de
            violação destes termos, uso indevido da plataforma ou
            determinação legal, respeitados os procedimentos aplicáveis.
          </p>
  
          <h3>12. Alterações dos termos</h3>
          <p>
            Estes termos poderão ser atualizados. Caso uma alteração
            exija novo consentimento, o profissional deverá realizar
            nova aceitação antes de continuar utilizando os recursos
            correspondentes.
          </p>
  
          <h3>13. Contato</h3>
          <p>
            Dúvidas e solicitações deverão ser encaminhadas aos canais
            oficiais do MedTriage, que precisam ser informados pelo
            responsável pela plataforma.
          </p>
  
          <h3>14. Declaração de aceite</h3>
          <p>
            Ao selecionar a opção de aceitação, o profissional declara
            que leu e compreendeu estes termos e concorda com as condições
            de utilização da plataforma.
          </p>
        `
      }
    };
  
    function criarModal() {
      if (document.getElementById("modal-termos-medtriage")) {
        return document.getElementById("modal-termos-medtriage");
      }
  
      const modal = document.createElement("div");
      modal.id = "modal-termos-medtriage";
  
      modal.innerHTML = `
        <div class="mt-modal-overlay">
          <section class="mt-modal" role="dialog"
                   aria-modal="true" aria-labelledby="mt-titulo">
  
            <header class="mt-modal-header">
              <h2 id="mt-titulo">Termos de uso</h2>
              <button type="button" id="mt-fechar-x"
                      aria-label="Fechar">×</button>
            </header>
  
            <div class="mt-modal-aviso">
              Leia todo o documento. O botão de aceitação será liberado
              quando você chegar ao final.
            </div>
  
            <div class="mt-modal-conteudo" id="mt-conteudo"></div>
  
            <footer class="mt-modal-footer">
              <button type="button" id="mt-fechar"
                      class="mt-btn-secundario">
                Fechar
              </button>
  
              <button type="button" id="mt-aceitar"
                      class="mt-btn-aceitar" disabled>
                Li e aceito
              </button>
            </footer>
  
          </section>
        </div>
      `;
  
      document.body.appendChild(modal);
  
      const style = document.createElement("style");
      style.textContent = `
        #modal-termos-medtriage {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 99999;
          font-family: Arial, sans-serif;
        }
  
        #modal-termos-medtriage.aberto {
          display: block;
        }
  
        .mt-modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, .65);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
        }
  
        .mt-modal {
          width: 100%;
          max-width: 680px;
          max-height: 88vh;
          background: white;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,.25);
        }
  
        .mt-modal-header {
          padding: 18px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd;
        }
  
        .mt-modal-header h2 {
          margin: 0;
          font-size: 21px;
          color: #005A8D;
        }
  
        #mt-fechar-x {
          border: 0;
          background: none;
          font-size: 28px;
          cursor: pointer;
          color: #555;
        }
  
        .mt-modal-aviso {
          padding: 12px 22px;
          background: #eef6fb;
          color: #174b69;
          font-size: 13px;
        }
  
        .mt-modal-conteudo {
          padding: 20px 24px;
          overflow-y: auto;
          line-height: 1.65;
          color: #333;
        }
  
        .mt-modal-conteudo h3 {
          margin: 18px 0 7px;
          color: #005A8D;
          font-size: 16px;
        }
  
        .mt-modal-conteudo h3:first-child {
          margin-top: 0;
        }
  
        .mt-modal-conteudo p {
          margin: 0 0 12px;
        }
  
        .mt-modal-footer {
          padding: 16px 22px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #ddd;
        }
  
        .mt-modal-footer button {
          border: 0;
          padding: 11px 18px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 600;
        }
  
        .mt-btn-secundario {
          background: #eee;
          color: #333;
        }
  
        .mt-btn-aceitar {
          background: #005A8D;
          color: white;
        }
  
        .mt-btn-aceitar:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
  
        .mt-termos-grupo {
          margin: 22px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
  
        .mt-termos-grupo input {
          width: 17px;
          height: 17px;
        }
  
        .mt-termos-grupo input:disabled {
          cursor: not-allowed;
        }
  
        .mt-termos-link {
          border: 0;
          background: none;
          color: #0077bb;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
          font: inherit;
        }
  
        @media (max-width: 600px) {
          .mt-modal {
            max-height: 94vh;
          }
  
          .mt-modal-conteudo {
            padding: 16px;
          }
        }
      `;
  
      document.head.appendChild(style);
  
      return modal;
    }
  
    function configurarFormulario(form, perfil) {
      if (!form || form.dataset.termosConfigurados === "true") {
        return;
      }
  
      form.dataset.termosConfigurados = "true";
  
      const idCheckbox = perfil === "paciente"
        ? "termos"
        : "medico-termos";
  
      const grupo = document.createElement("div");
      grupo.className = "mt-termos-grupo";
  
      grupo.innerHTML = `
        <input type="checkbox" id="${idCheckbox}" disabled>
        <label for="${idCheckbox}">Li e aceito os</label>
        <button type="button" class="mt-termos-link">
          termos de uso
        </button>
      `;
  
      const botaoEnviar = form.querySelector('[type="submit"]');
  
      // === CORREÇÃO: o insertBefore exige que a referência seja filho DIRETO
      // do form. No cadastro do médico o botão está dentro de um <div> (flex),
      // então precisamos subir até o wrapper direto antes de inserir. ===
      if (botaoEnviar) {
        let referencia = botaoEnviar;
        while (referencia.parentElement !== form) {
          referencia = referencia.parentElement;
        }
        form.insertBefore(grupo, referencia);
      } else {
        form.appendChild(grupo);
      }
  
      const checkbox = grupo.querySelector("input");
      const link = grupo.querySelector(".mt-termos-link");
  
      const modal = criarModal();
      const conteudo = modal.querySelector("#mt-conteudo");
      const titulo = modal.querySelector("#mt-titulo");
      const botaoAceitar = modal.querySelector("#mt-aceitar");
  
      let chegouAoFinal = false;
  
      function fecharModal() {
        modal.classList.remove("aberto");
      }
  
      function abrirModal() {
        chegouAoFinal = false;
        botaoAceitar.disabled = true;
  
        titulo.textContent = TERMOS[perfil].titulo;
        conteudo.innerHTML = TERMOS[perfil].conteudo;
  
        conteudo.scrollTop = 0;
        modal.classList.add("aberto");
  
        verificarRolagem();
      }
  
      function verificarRolagem() {
        const distancia =
          conteudo.scrollHeight -
          conteudo.scrollTop -
          conteudo.clientHeight;
  
        if (distancia <= 8) {
          chegouAoFinal = true;
          botaoAceitar.disabled = false;
        }
      }
  
      conteudo.addEventListener("scroll", verificarRolagem);
  
      link.addEventListener("click", (event) => {
        event.preventDefault();
        abrirModal();
    });
  
      modal.querySelector("#mt-fechar").addEventListener(
        "click",
        fecharModal
      );
  
      modal.querySelector("#mt-fechar-x").addEventListener(
        "click",
        fecharModal
      );
  
      botaoAceitar.addEventListener("click", () => {
        if (!chegouAoFinal) {
          return;
        }
  
        checkbox.disabled = false;
        checkbox.checked = true;
  
        fecharModal();
      });
  
      form.addEventListener("submit", (event) => {
        if (!checkbox.checked || checkbox.disabled) {
          event.preventDefault();
          event.stopImmediatePropagation();
  
          alert("Para continuar, leia e aceite os termos de uso.");
          return;
        }
  
        const identificador = perfil === "paciente"
          ? document.getElementById("input-cadastro-id")?.value
          : document.getElementById("medico-matricula")?.value;
  
        const aceite = {
          perfil: perfil,
          identificador: identificador || "",
          versao: VERSAO_TERMOS,
          dataAceite: new Date().toISOString(),
          termosAceitos: true
        };
  
        try {
          const aceites = JSON.parse(
            localStorage.getItem(CHAVE_ACEITES) || "[]"
          );
  
          aceites.push(aceite);
  
          localStorage.setItem(
            CHAVE_ACEITES,
            JSON.stringify(aceites)
          );
  
          sessionStorage.setItem(
            "@medtriage/aceite-pendente",
            JSON.stringify(aceite)
          );
  
        } catch (erro) {
          event.preventDefault();
          event.stopImmediatePropagation();
  
          alert("Não foi possível registrar o aceite. Tente novamente.");
          console.error("Erro ao registrar aceite:", erro);
        }
      }, true);
    }
  
    function iniciar() {
      configurarFormulario(
        document.getElementById("cadastro-form"),
        "paciente"
      );
  
      configurarFormulario(
        document.getElementById("cadastro-medico-form"),
        "profissional"
      );
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", iniciar);
    } else {
      iniciar();
    }
  })();