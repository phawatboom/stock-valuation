import { NextRequest, NextResponse } from "next/server";
import YahooFinance from 'yahoo-finance2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let YF: any = YahooFinance;
if (YF.default) {
  YF = YF.default;
}
const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = await yahooFinance.search(query);
    return NextResponse.json({ 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results: results.quotes.filter((q: any) => q.isYahooFinance).map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
        type: q.quoteType
      }))
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to search symbols" },
      { status: 500 }
    );
  }
}
