import { CSSProperties } from "react";
import { GoalPrice, GoalPriceType } from "../../data/GoalsData";
import { GameServices } from "../../services";
import { GameFlags } from "../../services/Config";
import { SchoolClassList } from "../../services/dataServices/SchoolService";
import { GS } from "../../services/GS";
import { FlagService } from "../../services/saveData/FlagService";

export class UIHelper{
    static getGoalPriceName(p:GoalPrice): string {
        switch(p.type){
            case GoalPriceType.incSavingInterest:
                return `Saving Account Interest-Rate +${p.value}%`
            case GoalPriceType.lowCreditInterest:
                return `Credit Account Interest-Rate -${p.value}%`
            case GoalPriceType.incSavingPeriod:
                return `Saving Account Interest Periods +${p.value}`
            case GoalPriceType.chanceForItem:
                return `Chance for Items added to the Shop: +${p.value}%`
            case GoalPriceType.lowShopPrices:
                return `Lower Shop prices by: ${p.value}%`
            case GoalPriceType.maxItemInShop:
                return `Increase max Items in the Shop by: ${p.value}`
            default:
                return 'Unknown Price'
        }
    }
    static getHiddenByFlag(flag:string): CSSProperties | undefined {
        let flagService = GameServices.getService<FlagService>(FlagService.serviceName)
        return flagService.getFlagBool(flag)?{display:'block'}:{display:'none'}
    }

    static getHiddenClass(school:SchoolClassList): CSSProperties | undefined {
        return GS.getShoolService().classFinished(school)?{display:'block'}:{display:'none'}
    }

    static hasTutorialCheck(level:number):boolean{
        let flagService = GameServices.getService<FlagService>(FlagService.serviceName)
       
        return flagService.getFlagInt(GameFlags.t_i_level) > level
    }

    static isVisible(visible:boolean):CSSProperties{
        return visible?{display:'block'}:{display:'none'}
    }
}