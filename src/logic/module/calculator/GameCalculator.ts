import { Potential } from "../../../model/Business";
import { Game } from "../../Game";

export class GameCalculator {
    
    public static getRangeWitWeight(base:number, potential:Potential, marketPotential:Potential) {
        
        let chance = Math.round(Math.random()*1000)
        let potent = Math.round(Math.random()*(potential + (marketPotential/4))-(base/100))
        let isPotent = chance < potent
        let maxChange = isPotent ? (potent-chance):(chance-potent)
        console.log(`${chance < potent?'win':'los'} Chance: ${chance} - ${potent} ${maxChange}`)
        let factor = GameCalculator.roundValue((Math.random()*(potential+maxChange))/(1000+base/100),3)
        let value =  GameCalculator.roundValue(base*factor/100,3)
        console.log(`Factor: ${factor} - Value: ${value}`)
        let result = base + (isPotent||base<=0.2?value:value*-1)
        if(result < 0) result = GameCalculator.roundValue(Math.random()*0.5,2)
        return result
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
}