import { GameServices, GlobalEvents } from "../services"
import { FlagService } from "../services/saveData/FlagService"

export class TutorialModul {

   
    private static instance:TutorialModul
    private _flagService: FlagService
    private _event: GlobalEvents

    private constructor() {
        if(TutorialModul.instance != undefined) throw new Error('no two allowed')
        this._event = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        this._flagService = GameServices.getService<FlagService>(FlagService.serviceName)
    }
    
    public static RunTutorial(){
        if(TutorialModul.instance == undefined){
            TutorialModul.instance = new TutorialModul()
        }


    }

}