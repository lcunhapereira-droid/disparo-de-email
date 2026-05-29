// ============================================================
//  CONFIGURACAO GERAL DO AGENTE DE CURADORIA DE CONTEUDO
//  Edite apenas este arquivo para personalizar o sistema.
//  Funciona para qualquer area: medicina, tecnologia, direito,
//  financas, marketing, programacao, etc.
// ============================================================

export const CONFIG = {

  // ----------------------------------------------------------
  // IDENTIDADE DO AGENTE
  // Quem recebe a curadoria e qual o contexto profissional.
  // ----------------------------------------------------------
  identidade: {
    nomeDestinatario: "Dra. Eriane Faria",
    descricaoProfissional: "Medica especialista em Saude Feminina e Funcional",
    identificacao: "CRM MG 100709",       // CRM, OAB, registro, cargo — ou deixe vazio ""
    localidade: "Belo Horizonte, Brasil",
    tituloEmail: "CURADORIA CIENTIFICA",  // texto grande no topo do email
  },

  // ----------------------------------------------------------
  // EMAIL
  // ----------------------------------------------------------
  email: {
    destinatario: "erianefariadamasia@gmail.com",
    assunto: "Curadoria Diaria",           // completado automaticamente com a data
    remetente: "Curadoria IA <onboarding@resend.dev>",
  },

  // ----------------------------------------------------------
  // HORARIO DE ENVIO AUTOMATICO (UTC)
  // Exemplos:
  //   "0 23 * * *"  = 20h Brasilia (UTC-3)
  //   "0 12 * * *"  = 09h Brasilia
  //   "0 14 * * 1"  = toda segunda-feira as 11h Brasilia
  // ----------------------------------------------------------
  cronSchedule: "0 23 * * *",

  // ----------------------------------------------------------
  // CORES E VISUAL DO EMAIL
  // Use qualquer cor hex. Para encontrar cores: coolors.co
  // ----------------------------------------------------------
  visual: {
    corPrimaria: "#9B8559",
    corSecundaria: "#b8a07a",
    corFundo: "#F9F8F7",
    corBannerTexto: "#F6E6EA",
    corDataFundo: "#DDE8E2",
    corDataTexto: "#4a6741",
    corRodape: "#1a1a1a",
  },

  // ----------------------------------------------------------
  // FONTES DE CONTEUDO (RSS feeds)
  // Cole a URL do feed RSS de qualquer site.
  // Para encontrar o RSS de um site, procure pelo icone RSS
  // ou tente adicionar /feed, /rss, /feed.xml ao final da URL.
  //
  // Exemplos de areas:
  //   Tecnologia: https://feeds.feedburner.com/TechCrunch
  //   Programacao: https://dev.to/feed
  //   IA: https://aiweekly.co/issues.rss
  //   Financas: https://feeds.bloomberg.com/markets/news.rss
  //   Direito: https://www.conjur.com.br/rss.xml
  // ----------------------------------------------------------
  feeds: [
    {
      url: "https://www.sciencedaily.com/rss/health_medicine/obesity.xml",
      categoria: "Endocrinologia",
      fonte: "ScienceDaily - Obesidade e Metabolismo",
    },
    {
      url: "https://www.sciencedaily.com/rss/health_medicine/menopause.xml",
      categoria: "Ginecologia",
      fonte: "ScienceDaily - Menopausa e Climaterio",
    },
    {
      url: "https://www.sciencedaily.com/rss/health_medicine/skin_care.xml",
      categoria: "Dermatologia",
      fonte: "ScienceDaily - Dermatologia",
    },
    {
      url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss",
      categoria: "Geral",
      fonte: "New England Journal of Medicine",
    },
    {
      url: "https://www.bmj.com/rss/current.xml",
      categoria: "Geral",
      fonte: "British Medical Journal",
    },
    {
      url: "https://jamanetwork.com/rss/site_3/68.xml",
      categoria: "Dermatologia",
      fonte: "JAMA Dermatology",
    },
    {
      url: "https://www.thelancet.com/rssfeed/lancet_online.xml",
      categoria: "Geral",
      fonte: "The Lancet",
    },
    {
      url: "https://www.thelancet.com/rssfeed/landef_online.xml",
      categoria: "Endocrinologia",
      fonte: "The Lancet Diabetes & Endocrinology",
    },
  ],

  // ----------------------------------------------------------
  // SECOES DO EMAIL
  // Como o conteudo sera agrupado no email.
  // Adapte para sua area: pode ser tecnologias, praticas,
  // subtemas, regioes, tipos de conteudo, etc.
  // ----------------------------------------------------------
  secoes: [
    "ENDOCRINOLOGIA E METABOLISMO",
    "GINECOLOGIA, SAUDE DA MULHER E MENOPAUSA",
    "DERMATOLOGIA ESTETICA",
  ],

  // ----------------------------------------------------------
  // FILTRO DE QUALIDADE
  // Diga ao agente o que vale a pena incluir e o que ignorar.
  // Adapte para sua area.
  // ----------------------------------------------------------
  filtro: {
    incluir: [
      "Estudos clinicos com resultados praticos",
      "Meta-analises e revisoes sistematicas",
      "Novidades com impacto direto na atuacao profissional",
      "Diretrizes e consensos de entidades reconhecidas",
    ],
    excluir: [
      "Conteudo promocional ou publicitario",
      "Eventos, congressos e chamadas de trabalhos",
      "Opiniao sem embasamento tecnico",
      "Conteudo repetido ou sem novidade relevante",
      "Noticias institucionais sem aplicacao pratica",
    ],
  },

  // ----------------------------------------------------------
  // IDIOMA DE SAIDA
  // O agente sempre entregara o resumo neste idioma,
  // traduzindo automaticamente qualquer fonte estrangeira.
  // ----------------------------------------------------------
  idiomaSaida: "portugues brasileiro",

};
