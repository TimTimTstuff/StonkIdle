import { Potential } from "../../../model/Business";

export class GameCalculator {
    public static getRangeWitWeight(base:number, potential:Potential) {
        
        let chance = (Math.random()*1000)
        let isPotent = chance < potential
        let marketPotential = Potential.Medium
        let factor = Math.random()*potential/(1000-marketPotential)
        let value = base-(base * ((factor/100)+1))
        console.log([base, factor, value])

        return base + (isPotent||base<=0.2?value:value*-1)
    }   
}