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

        //news
        if(save.news === undefined){
            save.news = []
        }

        //flags
        let keys = Object.keys(dSave.flags)
        keys.forEach(k =>{
            if(save.flags[k] === undefined){
                save.flags[k] = dSave.flags[k]
                console.log('Add: '+k)
            }
        })

        if(save.player.schools === undefined){
            save.player.schools = []
            console.log('Add School')
        }
    }

}