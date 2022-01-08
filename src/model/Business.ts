import { StockPrice } from "./StockPrice"

export interface MarketIndex{
    name: string
    listedBusiness: string[]
    trend: number
}

export enum BusinessIndustry{
    Tourism = 1,
    PowerSupply = 2,
    Information = 3,
    FoodAndBaverage = 4,
    Agriculture = 5,
    HealthCare = 6,
    FinancialServices = 7,
    OilAndGas = 8,
    RealEstate = 9,
}

export enum Potential{
    VeryLow = 150,
    Low = 350,
    Medium = 550,
    High = 700,
    VeryHigh = 900
}

export enum MarketVolatility {
    Low = -200,
    Medium = 0,
    High = 100
}

export interface Business {
    name: string
    shortName: string
    floatingStock: number
    totalStock: number
    stockPriceHistory: StockPrice[]
    potential:Potential
    basePotential:Potential
    createTick:number
    historyCicle:{[index:string]:HistorySlice}
    historyAge:{[index:string]:HistorySlice}
    industry:BusinessIndustry
}
export interface HistorySlice {
    high:number
    low:number
    start:number
    end:number
}
