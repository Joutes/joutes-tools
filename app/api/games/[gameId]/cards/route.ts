import {NextRequest, NextResponse} from "next/server";
import {BoosterCard} from "@/lib/types/booster";
import meilisearch, {indexes} from "@/lib/meilisearch";

async function search({ searchQuery, lang, setCode }: { searchQuery: string; lang: string; setCode: string }): Promise<BoosterCard[]> {
  const index = meilisearch.index<BoosterCard>(indexes.riftbound);

  const queryOptions: { filter: string[] } = {filter: []};
  let queryString = "";

  if (searchQuery.includes(' lang:')) {

  } else if (lang !== 'en') {
    queryOptions.filter.push(
      `lang IN [en, ${lang}]`,
    );
  } else {
    queryOptions.filter.push(
      `lang IN [en]`,
    );
  }


  const setRegex = /(?: e|^e|^set| set):(?<set>[\w\*]+)/gm;
  const setResult = setRegex.exec(searchQuery);
  if (setResult?.groups?.set === '*') {
  } else if (setResult?.groups?.set) {
    queryOptions.filter.push(
      `setCode = ${setResult?.groups?.set}`,
    );
  } else {
    queryOptions.filter.push(
      `setCode = ${setCode}`,
    );
  }

  const cnRegex = /(?: cn|^cn):(?<cn>[\w\*]+)/gm;
  const cnResult = cnRegex.exec(searchQuery);
  if (cnResult?.groups?.cn) {
    queryOptions.filter.push(
      `collectorNumber = ${cnResult?.groups?.cn}`,
    );
  } else {
    const queryNumber = parseInt(searchQuery);
    if (!isNaN(queryNumber)) {
      queryOptions.filter.push(
        `collectorNumber CONTAINS "${queryNumber}"`,
      );
    } else {
      queryString = searchQuery;
    }
  }

  const result = await index.search(queryString, queryOptions);

  return result.hits;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  const searchParams = new URL(request.url).searchParams;
  const setCode = searchParams.get('setCode') || '';
  const searchQuery = searchParams.get('searchQuery') || '';
  const lang = searchParams.get('lang') || 'en';

  const cards = await search({
    searchQuery,
    lang,
    setCode,
  });

  return NextResponse.json(cards);
}