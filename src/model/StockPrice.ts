  
    export enum StockPriceKeyPoint{
        Minute,
        Hour,
        Day,
        Week,
        Month,
        Year
    }

    export interface StockPrice {
        date: number;
        keyPoint: StockPriceKeyPoint;
        buyPrice: number;
        sellPrice: number;
    }
