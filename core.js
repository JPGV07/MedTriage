/* =========================================================
   CORE.JS — Núcleo compartilhado entre todas as páginas
   =========================================================
   Contém três módulos reutilizáveis:
     1. Storage  → encapsula o localStorage (get/set/remove)
     2. Auth     → controle de login/logout e permissões
     3. Utils    → funções auxiliares (formatar nome, consultório)
   ========================================================= */

/* =========================================================
   1) STORAGE — camada de abstração do localStorage
   ========================================================= */
const Storage = {
  /* Mapa central de chaves do localStorage.
     Evita erros de digitação ("regrasMedTriage" vs "regrasMedTriage ") */
  keys: {
    paciente: 'pacienteData',      // dados do cadastro do paciente
    afericao: 'afericaoData',      // resultado da aferição
    fila:     'fila',              // fila de pacientes aguardando
    regras:   'regrasMedTriage',   // regras criadas pelo admin
    user:     'user',              // usuário logado (médico/admin)
    chamado:  'pacienteChamado'    // paciente sendo chamado na TV
  },

  /* Lê e desserializa um valor do localStorage.
     Retorna fallback se não existir ou se o JSON estiver corrompido. */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback; // JSON inválido → devolve valor padrão
    }
  },

  /* Serializa e salva um valor no localStorage */
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  /* Remove uma chave do localStorage */
  remove(key) {
    localStorage.removeItem(key);
  }
};

/* =========================================================
   2) AUTH — controle de sessão e permissão
   ========================================================= */
const Auth = {
  /* Retorna o usuário logado (ou null) */
  getUser() {
    return Storage.get(Storage.keys.user);
  },

  /* Encerra a sessão e volta para a tela inicial */
  logout() {
    Storage.remove(Storage.keys.user);
    window.location.href = 'index.html';
  },

  /* Verifica se o usuário tem o papel exigido ('admin' ou 'medico').
     Se não tiver, mostra alerta e redireciona. Retorna o user ou null. */
  requireRole(role) {
    const user = this.getUser();
    if (!user || user.tipo !== role) {
      alert(`Acesso apenas para ${role === 'admin' ? 'administradores' : 'médicos'}.`);
      window.location.href = 'index.html';
      return null;
    }
    return user;
  }
};

/* =========================================================
   3) UTILS — funções auxiliares reutilizáveis
   ========================================================= */
const Utils = {
  /* Mapa de especialidade → consultório físico.
     Usado pelo médico para saber para onde chamar o paciente. */
  especialidadesConsultorio: {
    'Pediatria':     'Consultório 1',
    'Clínica Geral': 'Consultório 2',
    'Geriatria':     'Consultório 3'
  },

  /* Devolve o consultório com base na especialidade.
     Fallback: "Consultório Geral". */
  getConsultorioPorEspecialidade(esp) {
    return this.especialidadesConsultorio[esp] || 'Consultório Geral';
  },

  /* Converte IDs técnicos de sintomas (ex: "febre_alta")
     em nomes amigáveis (ex: "Febre alta (aferição ≥ 37.2°C)"). */
  formatarNome(str) {
    // Dicionário de traduções manuais para casos especiais
    const especiais = {
      febre_alta: 'Febre alta (aferição ≥ 37.2°C)',
      pressao_alta: 'Pressão arterial elevada (aferição ≥ 110/80)',
      febre_40: 'Febre ≥ 40°C',
      febre_38: 'Febre 38°C - 39.9°C',
      dificudade_de_locomocao: 'Dificuldade de Locomoção',
      dificudade_da_fala: 'Dificuldade da Fala',
      visao_embacada: 'Visão Embaçada',
      parada_cardiaca: 'Parada Cardíaca',
      convulsao: 'Convulsão',
      hemorragia: 'Hemorragia Intensa',
      queimadura_3_grau: 'Queimadura 3º Grau',
      dor_peito_intensa: 'Dor no Peito Intensa',
      confusao_mental: 'Confusão Mental',
      alucinacoes: 'Alucinações',
      envenenamento: 'Envenenamento',
      vomitos_persistentes: 'Vômitos Persistentes',
      desidratacao: 'Desidratação',
      dor_abdominal_intensa: 'Dor Abdominal Intensa',
      desmaio_recente: 'Desmaio Recente',
      cefaleia_intratavel: 'Dor de Cabeça Intensa',
      palpitacoes: 'Palpitações',
      tontura_persistente: 'Tontura Persistente',
      anemia_grave: 'Anemia Grave',
      sangramento_nasal: 'Sangramento Nasal',
      nauseas_intensas: 'Náuseas intensas',
      diarreia_aguda: 'Diarreia aguda',
      dor_cabeca: 'Dor de Cabeça',
      tosse_persistente: 'Tosse Persistente',
      dor_garganta: 'Dor de Garganta',
      fadiga: 'Fadiga',
      dor_lombar: 'Dor Lombar',
      insonia: 'Insônia',
      ansiedade: 'Ansiedade',
      coriza: 'Coriza',
      espirros: 'Espirros',
      dor_muscular: 'Dor muscular generalizada',
      calafrios: 'Calafrios',
      mal_estar: 'Mal-estar geral'
    };

    // Se achou no dicionário, devolve direto
    if (especiais[str]) return especiais[str];

    // Fallback: troca "_" por espaço e capitaliza cada palavra
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};
