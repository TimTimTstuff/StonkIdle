import { StockPrice, StockPriceKeyPoint } from "./StockPrice"

export interface MarketIndex{
    name: string
    listedBusiness: string[]
    trend: number
}

export interface Business {
    name: string
    shortName: string
    floatingStock: number
    totalStock: number
    stockPriceHistory: StockPrice[]
}
