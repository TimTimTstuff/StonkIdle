import { CSSProperties } from "react";
import { GameServices } from "../../services";
import { FlagService } from "../../services/saveData/FlagService";

export class UIHelper{
    static getHiddenByFlag(flag:string): CSSProperties | undefined {
        let flagService = GameServices.getService<FlagService>(FlagService.serviceName)
        return flagService.getFlagBool(flag)?{display:'block'}:{display:'none'}
    }


}