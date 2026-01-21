import { NextRequest, NextResponse } from "next/server";
import { getStockData } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol parameter is required" },
      { status: 400 }
    );
  }

  try {
    const data = await getStockData(symbol);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data", details: String(error) },
      { status: 500 }
    );
  }
}
