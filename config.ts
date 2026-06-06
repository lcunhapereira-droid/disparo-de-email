export const CONFIG = {

  identidade: {
    nomeDestinatario: "Dra. Eriane Faria",
    descricaoProfissional: "Medica e fisioterapeuta especialista em Saude Feminina e Funcional",
    identificacao: "CRM MG 100709",
    localidade: "Belo Horizonte, Brasil",
    tituloEmail: "CURADORIA CIENTIFICA",
  },

  email: {
    destinatario: "erianedamasia@gmail.com",
    assunto: "Resumo Medico Diario - Curadoria Executiva - Dra. Eriane Faria",
    remetente: "Curadoria IA <lcunhapereira@gmail.com>",
  },

  cronSchedule: "0 23 * * *",

  visual: {
    corPrimaria: "#9B8559",
    corSecundaria: "#b8a07a",
    corFundo: "#F9F8F7",
    corBannerTexto: "#F6E6EA",
    corDataFundo: "#DDE8E2",
    corDataTexto: "#4a6741",
    corRodape: "#1a1a1a",
  },

  feeds: [
    { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gynecology+women+health&format=rss&limit=15", categoria: "Ginecologia", fonte: "PubMed - Ginecologia" },
    { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=endocrinology+obesity+weight+loss&format=rss&limit=15", categoria: "Endocrinologia", fonte: "PubMed - Endocrinologia" },
    { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=aesthetic+dermatology+skin&format=rss&limit=15", categoria: "Dermatologia", fonte: "PubMed - Dermatologia" },
    { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=menopause+climacteric+hormone&format=rss&limit=15", categoria: "Menopausa", fonte: "PubMed - Menopausa" },
    { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=polycystic+ovary+syndrome+PCOS&format=rss&limit=15", categoria: "Ginecologia", fonte: "PubMed - SOP" },
    { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=thyroid+autoimmune+women&format=rss&limit=15", categoria: "Endocrinologia", fonte: "PubMed - Tireoide" },
    { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=functional+medicine+nutrition+microbiome&format=rss&limit=15", categoria: "Medicina Funcional", fonte: "PubMed - Medicina Funcional" },
    { url: "https://www.nature.com/nm.rss", categoria: "Pesquisa", fonte: "Nature Medicine" },
    { url: "https://www.thelancet.com/rssfeed/lancet_online.xml", categoria: "Pesquisa", fonte: "The Lancet" },
    { url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss", categoria: "Pesquisa", fonte: "NEJM" },
    { url: "https://jamanetwork.com/rss/site_3/67.xml", categoria: "Pesquisa", fonte: "JAMA" },
    { url: "https://www.bmj.com/rss/thebmj.xml", categoria: "Pesquisa", fonte: "BMJ" },
    { url: "https://www.sciencedaily.com/rss/health_medicine/womens_health.xml", categoria: "Saude da Mulher", fonte: "ScienceDaily - Saude Mulher" },
    { url: "https://www.sciencedaily.com/rss/health_medicine/obesity_and_overweight.xml", categoria: "Endocrinologia", fonte: "ScienceDaily - Emagrecimento" },
    { url: "https://www.sciencedaily.com/rss/health_medicine/skin_care.xml", categoria: "Dermatologia", fonte: "ScienceDaily - Dermatologia" },
    { url: "https://www.cochranelibrary.com/feed/rss", categoria: "Pesquisa", fonte: "Cochrane Library" },
    { url: "https://www.nih.gov/rss/news.xml", categoria: "Pesquisa", fonte: "NIH" },
    { url: "https://www.gov.br/saude/pt-br/assuntos/noticias/RSS", categoria: "Brasil", fonte: "Ministerio Saude BR" },
    { url: "https://www.nice.org.uk/guidance/published?type=apg,csg,cg,mpg,ph,sg,sc&format=rss", categoria: "Diretrizes", fonte: "NICE UK" },
    { url: "https://www.who.int/rss-feeds/news-english.xml", categoria: "Global", fonte: "OMS / WHO" },
  ],

  secoes: [
    "GINECOLOGIA E SAUDE DA MULHER",
    "ENDOCRINOLOGIA, METABOLISMO E TIREOIDE",
    "MENOPAUSA E CLIMATÉRIO",
    "DERMATOLOGIA ESTETICA",
    "MEDICINA FUNCIONAL E MICROBIOMA",
    "DIRETRIZES E EVIDENCIAS CLINICAS",
  ],

  filtro: {
    incluir: [
      "Ensaios clinicos randomizados e meta-analises",
      "Revisoes sistematicas com impacto clinico direto",
      "Diretrizes de entidades reconhecidas internacionalmente",
      "Inovacoes terapeuticas com evidencia cientifica robusta",
    ],
    excluir: [
      "Conteudo promocional ou publicitario",
      "Eventos, congressos e chamadas de trabalhos",
      "Opiniao sem embasamento em evidencias",
      "Noticias institucionais sem aplicacao clinica",
    ],
  },

  promptCustom: "Voce e a curadora cientifica da Dra. Eriane Faria, medica e fisioterapeuta especialista em Saude Feminina e Funcional (CRM MG 100709), Belo Horizonte. Selecione os artigos mais relevantes clinicamente e produza um resumo executivo em HTML com estilos inline, organizado por especialidade, maximo 5 artigos por especialidade, tom rigoroso estilo The Lancet, sem linguagem comercial.",

  idiomaSaida: "portugues brasileiro",

};
