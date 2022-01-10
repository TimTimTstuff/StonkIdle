import { faAngleDoubleDown, faAngleDoubleUp, faAngleDown, faAngleUp, faEquals, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Business, MarketVolatility, Potential } from "../../../model/Business";
import { GameRandom } from "./GameRandom";

export class GameCalculator {
    
    public static calculateBusinessSellPrice(business:Business, currentValue:number, marketPotential:Potential){
        let marketChance = GameRandom.GetRandom(0,1100-marketPotential)
        let businessChance = GameRandom.GetRandom(0,(business.potential+(business.basePotential*2))/3)
        let isUp = businessChance > marketChance

        let maxChangeInStock = isUp? ((businessChance*2)-marketChance) : ((marketChance*2)-businessChance)

        let change = maxChangeInStock/(1200-marketPotential)

        let priceChange = GameCalculator.roundValue(currentValue*(change/100),3)
        let newPrice = currentValue + (isUp ? priceChange : priceChange*-1)
        if(priceChange <= 0.001) {
            console.log(priceChange)
            priceChange = 0.01
        }

        if(newPrice <= 0) newPrice = GameCalculator.roundValue(Math.random(),2)

        return newPrice
    }

    public static getVolatilityClassIcon(volatility: MarketVolatility):{i:IconDefinition, c:string} {
       let icon = faAngleDown
       let cClass = 'marketLow'
       switch(volatility){
           case MarketVolatility.High:
               icon = faAngleUp
               cClass = 'marketHigh'
               break
           case MarketVolatility.Medium:
               icon = faEquals
               cClass = 'marketEqual'
               break
            case MarketVolatility.Low:
                icon = faAngleDown
                cClass = 'marketLow'
                break
       }

       return {i: icon, c:cClass}
    }

    public static getPotentialClassIcon(potential:Potential):{i:IconDefinition, c:string}{
        let icon = faAngleDoubleDown
        let cClass = 'marketVeryLow'

        if(potential >= Potential.VeryHigh){
            icon = faAngleDoubleUp
            cClass = 'marketVeryHigh'
        }else if(potential >= Potential.High)
        {
            icon = faAngleUp
            cClass = 'marketHigh'
        }else if(potential >= Potential.Medium)
        {
            icon = faEquals
            cClass = 'marketEqual'
        }else if(potential >= Potential.Low)
        {
            icon = faAngleDown
            cClass = 'marketLow'
        }else if(potential >= Potential.VeryLow)
        {
            icon = faAngleDoubleDown
            cClass = 'marketVeryLow'
        }

        return {c:cClass, i:icon}
    }
    
    public static roundValue(value:number, precision:number = 2){
        let base = 1;
        for(var i = 0; i<precision; i++){
            base *=10
        }
        let result = Math.round(value*base)/base

        return result
    }

    public static roundValueToEuro(value:number, precision:number = 2){
        return GameCalculator.roundValue(value,precision)+'€'
    }

    public static checkChance(chance:number, max:number = 1000) {
        return chance > Math.random()*max
    }
    
}