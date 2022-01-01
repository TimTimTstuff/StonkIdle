import { Business, MarketVolatility, Potential } from "../../../model/Business";
import { GameServices } from "../../services";
import { GameConfig } from "../../services/Config";
import { TimeService } from "../../services/timeService/TimeService";
import { GameCalculator } from "../calculator/GameCalculator";

const demoName = [
    {n: "World Idle Platform", s: "WIP"},
    {n: "Little Lama Loft", s:'LOL'},
    {n: "Ultra Waifu United", s:'UWU'},
    {n: "Alter Reconstruction", s:'ARE'},
    {n: "Riddle with me", s:'RWM'}
]

export class BusinessHelper {
   
    private static curIN:number =  0;

    public static generateBusiness():Business{
        let maxStock = Math.floor((Math.random()*100000)+10000)
        let floatingStock = Math.floor(maxStock/100*GameConfig.defaultFloatingPercentage)
        let demoBus = demoName[BusinessHelper.curIN]
        BusinessHelper.curIN++ 
        let startPrice = GameCalculator.roundValue(Math.random()*GameConfig.maxShareStartPrice)

        let business: Business = {
            createTick: GameServices.getService<TimeService>(TimeService.serviceName).getTicks(),
            floatingStock:floatingStock,
            name: demoBus.n,
            potential: Potential.High,
            shortName: demoBus.s,
            stockPriceHistory: [
                {sellPrice: startPrice, buyPrice: startPrice+0.5, date: 100 },
                {sellPrice: startPrice+0.1, buyPrice: startPrice+0.7, date: 100 },
            ],
            totalStock: maxStock,
            historyAge:{},
            historyCicle:{}
        }

        return business
    }

    public static getRandomVolatitlity(): MarketVolatility {
        let pot = (Math.random()*600)-300
        if(pot <= MarketVolatility.Low) return MarketVolatility.Low
        if(pot <= MarketVolatility.Medium) return MarketVolatility.Medium
        return MarketVolatility.High
    }

    public static getRandomPotential():Potential{
        let pot = Math.random()*GameConfig.maxPotential
        if(pot <= Potential.VeryLow)return Potential.VeryLow
        if(pot <= Potential.Low)return Potential.Low
        if(pot <= Potential.Medium)return Potential.Medium
        if(pot <= Potential.High)return Potential.High
        return Potential.VeryHigh
    }

}