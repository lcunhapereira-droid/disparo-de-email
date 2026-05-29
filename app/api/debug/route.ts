import { NextResponse } from "next/server";
import axios from "axios";
import { parseStringPromise } from "xml2js";

const RSS_FEEDS = [
  { url: "https://www.sciencedaily.com/rss/health_medicine/womens_health.xml", fonte: "ScienceDaily Womens Health" },
  { url: "https://www.sciencedaily.com/rss/health_medicine/obesity.xml", fonte: "ScienceDaily Obesity" },
  { url: "https://www.sciencedaily.com/rss/health_medicine/skin_care.xml", fonte: "ScienceDaily Skin" },
  { url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss", fonte: "NEJM" },
  { url: "https://www.bmj.com/rss/current.xml", fonte: "BMJ" },
  { url: "https://jamanetwork.com/rss/site_3/68.xml", fonte: "JAMA Dermatology" },
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
