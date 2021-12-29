import { StockPrice } from "./StockPrice"

export interface MarketIndex{
    name: string
    listedBusiness: string[]
    trend: number
}

export enum Potential{
    VeryLow = 100,
    Low = 300,
    Medium = 500,
    High = 700,
    VeryHigh = 900
}

export interface Business {
    name: string
    shortName: string
    floatingStock: number
    totalStock: number
    stockPriceHistory: StockPrice[]
    potential:Potential
    createTick:number
    historyCicle:{[index:string]:HistorySlice}
    historyAge:{[index:string]:HistorySlice}
}
export interface HistorySlice {
    high:number
    low:number
    start:number
    end:number
}
