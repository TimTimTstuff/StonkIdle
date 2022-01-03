import { faAngleDoubleDown, faAngleDoubleUp, faAngleDown, faAngleUp, faEquals, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { MarketVolatility, Potential } from "../../../model/Business";

export class GameCalculator {
    
    
    public static getRangeWitWeight(base:number, potential:Potential, marketPotential:Potential) {
        
        let chance = Math.round(Math.random()*(1000-marketPotential))
        let potent = Math.round(Math.random()*potential)
        let isPotent = chance < potent
        let maxChange = isPotent ? (potent-chance):(chance-potent)
        let factor = GameCalculator.roundValue((Math.random()*(potential+maxChange))/(1000+base/100),3)
        let value =  GameCalculator.roundValue((base/(base/10))*(factor/100),3)
        let result = base + (isPotent||base<=0.2?value:value*-1)
        if(result < 0) result = GameCalculator.roundValue(Math.random()*0.5,2)
        return result
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
        switch (potential) {
            case Potential.VeryHigh:
                icon = faAngleDoubleUp
                cClass = 'marketVeryHigh'
                break
            case Potential.High:
                icon = faAngleUp
                cClass = 'marketHigh'
                break
            case Potential.Medium:
                icon = faEquals
                cClass = 'marketEqual'
                break
            case Potential.Low:
                icon = faAngleDown
                cClass = 'marketLow'

                break
            case Potential.VeryLow:
                icon = faAngleDoubleDown
                cClass = 'marketVeryLow'
                break
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