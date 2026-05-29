// ============================================================
//  CONFIGURACAO GERAL DO AGENTE DE CURADORIA MEDICA
//  Edite apenas este arquivo para personalizar o sistema.
// ============================================================

export const CONFIG = {

  // ----------------------------------------------------------
  // IDENTIDADE DO MEDICO / PROFISSIONAL
  // ----------------------------------------------------------
  medico: {
    nome: "Dra. Eriane Faria",
    titulo: "Saude Feminina e Funcional",
    registro: "CRM MG 100709",
    cidade: "Belo Horizonte",
  },

  // ----------------------------------------------------------
  // EMAIL DE DESTINO E REMETENTE
  // ----------------------------------------------------------
  email: {
    destinatario: "erianefariadamasia@gmail.com",
    assunto: "Curadoria Cientifica", // sera completado com a data automaticamente
    remetente: "Curadoria Medica <onboarding@resend.dev>",
  },

  // ----------------------------------------------------------
  // HORARIO DE ENVIO AUTOMATICO
  // Formato cron UTC. Exemplos:
  //   "0 23 * * *"  = 20h Brasilia (UTC-3)
  //   "0 22 * * *"  = 19h Brasilia
  //   "0 12 * * 1"  = toda segunda-feira ao meio-dia UTC
  // ----------------------------------------------------------
  cronSchedule: "0 23 * * *",

  // ----------------------------------------------------------
  // CORES E VISUAL DO EMAIL
  // ----------------------------------------------------------
  visual: {
    corPrimaria: "#9B8559",       // dourado - titulos e destaques
    corSecundaria: "#b8a07a",     // dourado claro - gradiente
    corFundo: "#F9F8F7",          // fundo geral
    corBannerTexto: "#F6E6EA",    // texto do subtitulo no banner
    corDataFundo: "#DDE8E2",      // fundo da data
    corDataTexto: "#4a6741",      // texto da data
    corRodape: "#1a1a1a",         // fundo do rodape
  },

  // ----------------------------------------------------------
  // ESPECIALIDADES E FEEDS RSS
  // Adicione ou remova especialidades conforme necessario.
  // Para encontrar feeds RSS de um site: acesse o site e
  // procure pelo icone RSS ou adicione /rss ou /feed na URL.
  // ----------------------------------------------------------
  feeds: [
    {
      url: "https://www.sciencedaily.com/rss/health_medicine/obesity.xml",
      especialidade: "Endocrinologia",
      fonte: "ScienceDaily - Obesidade e Metabolismo",
    },
    {
      url: "https://www.sciencedaily.com/rss/health_medicine/menopause.xml",
      especialidade: "Ginecologia",
      fonte: "ScienceDaily - Menopausa e Climaterio",
    },
    {
      url: "https://www.sciencedaily.com/rss/health_medicine/skin_care.xml",
      especialidade: "Dermatologia",
      fonte: "ScienceDaily - Dermatologia",
    },
    {
      url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss",
      especialidade: "Medicina Geral",
      fonte: "New England Journal of Medicine",
    },
    {
      url: "https://www.bmj.com/rss/current.xml",
      especialidade: "Medicina Geral",
      fonte: "British Medical Journal",
    },
    {
      url: "https://jamanetwork.com/rss/site_3/68.xml",
      especialidade: "Dermatologia",
      fonte: "JAMA Dermatology",
    },
    {
      url: "https://www.thelancet.com/rssfeed/lancet_online.xml",
      especialidade: "Medicina Geral",
      fonte: "The Lancet",
    },
    {
      url: "https://www.thelancet.com/rssfeed/landef_online.xml",
      especialidade: "Endocrinologia",
      fonte: "The Lancet Diabetes & Endocrinology",
    },
  ],

  // ----------------------------------------------------------
  // SECOES DO EMAIL (agrupamento das especialidades acima)
  // O Gemini vai organizar os artigos nestas secoes.
  // ----------------------------------------------------------
  secoes: [
    "ENDOCRINOLOGIA E METABOLISMO (emagrecimento, obesidade, diabetes, tireoide)",
    "GINECOLOGIA, SAUDE DA MULHER E MENOPAUSA",
    "DERMATOLOGIA ESTETICA",
  ],

  // ----------------------------------------------------------
  // FILTRO DE QUALIDADE (instrucoes para o Gemini)
  // Defina o que incluir e excluir da curadoria.
  // ----------------------------------------------------------
  filtro: {
    incluir: [
      "Estudos clinicos randomizados (RCTs)",
      "Meta-analises e revisoes sistematicas",
      "Estudos clinicos com resultados relevantes para pratica medica",
      "Diretrizes e consensos de sociedades medicas",
      "Pesquisas com impacto direto no manejo de pacientes",
    ],
    excluir: [
      "Editoriais, cartas ao editor, opinoes",
      "Noticias institucionais, eventos, congressos, chamadas de trabalhos",
      "Obituarios, homenagens, premiacoes",
      "Conteudo promocional ou comercial",
      "Estudos apenas em animais ou in vitro sem aplicacao clinica clara",
      "Qualquer conteudo sem relevancia clinica direta",
    ],
  },

};
