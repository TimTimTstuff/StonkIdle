import { CSSProperties } from "react";
import { GameServices } from "../../services";
import { GameFlags } from "../../services/Config";
import { FlagService } from "../../services/saveData/FlagService";

export class UIHelper{
    static getHiddenByFlag(flag:string): CSSProperties | undefined {
        let flagService = GameServices.getService<FlagService>(FlagService.serviceName)
        return flagService.getFlagBool(flag)?{display:'block'}:{display:'none'}
    }

    static hasTutorialCheck(level:number):boolean{
        let flagService = GameServices.getService<FlagService>(FlagService.serviceName)
       
        return flagService.getFlagInt(GameFlags.t_i_level) > level
    }

    static isVisible(visible:boolean):CSSProperties{
        return visible?{display:'block'}:{display:'none'}
    }
}