import { MainSave } from "../../../model/MainSave";
import { GameConfig } from "../../services/Config";

export class SaveFileCleaner {

   public  static update_04(save: MainSave){
        let dSave = GameConfig.getDefaultSave()
        
        //Credit account missing
        if(save.player.creditAccount === undefined){
            save.player.creditAccount = dSave.player.creditAccount
        }

        //goals
        if(save.player.goals === undefined){
            save.player.goals = {}
        }
    }

}