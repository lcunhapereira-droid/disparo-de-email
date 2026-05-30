import { NextResponse } from "next/server";
import axios from "axios";
import { parseStringPromise } from "xml2js";

const RSS_FEEDS = [
  { url: "https://www.sciencedaily.com/rss/health_medicine/obesity.xml", fonte: "ScienceDaily Obesity" },
  { url: "https://www.sciencedaily.com/rss/health_medicine/menopause.xml", fonte: "ScienceDaily Menopause" },
  { url: "https://www.sciencedaily.com/rss/health_medicine/skin_care.xml", fonte: "ScienceDaily Skin" },
  { url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss", fonte: "NEJM" },
  { url: "https://www.bmj.com/rss/current.xml", fonte: "BMJ" },
  { url: "https://jamanetwork.com/rss/site_3/68.xml", fonte: "JAMA Dermatology" },
  { url: "https://jamanetwork.com/rss/site_3/67.xml", fonte: "JAMA" },
  { url: "https://www.thelancet.com/rssfeed/lancet_online.xml", fonte: "The Lancet" },
  { url: "https://www.thelancet.com/rssfeed/landef_online.xml", fonte: "Lancet Diabetes Endocrinology" },
  { url: "https://www.jaad.org/rss/S0190-9622.xml", fonte: "JAAD Dermatology" },
  { url: "https://www.ajog.org/rss/S0002-9378.xml", fonte: "AJOG" },
  { url: "https://www.fertstert.org/rss/S0015-0282.xml", fonte: "Fertility and Sterility" },
  { url: "https://academic.oup.com/rss/site_5508/advanceaccess.xml", fonte: "JCEM Endocrine Society" },
];

export async function GET() {
  const resultados: Record<string, unknown> = {};

  for (const feed of RSS_FEEDS) {
    try {
      const response = await axios.get(feed.url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/rss+xml, */*" },
      });
      const resultado = await parseStringPromise(response.data, { explicitArray: false });
      const itens = resultado?.rss?.channel?.item || resultado?.feed?.entry || [];
      const lista = Array.isArray(itens) ? itens : [itens];
      resultados[feed.fonte] = { ok: true, total: lista.length, primeiro: String(lista[0]?.title?.["_"] || lista[0]?.title || "").substring(0, 80) };
    } catch (err) {
      resultados[feed.fonte] = { ok: false, erro: err instanceof Error ? err.message : String(err) };
    }
  }

  return NextResponse.json(resultados);
}
