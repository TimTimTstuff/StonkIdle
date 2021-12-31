import { GameServices, GlobalEvents, LogService } from "../services"
import { EventNames, GameFlags } from "../services/Config"
import { FlagService } from "../services/saveData/FlagService"

export class TutorialModul {

   
    private static instance:TutorialModul
    private _flagService: FlagService
    private _event: GlobalEvents
    private _log: LogService
    private constructor() {
        // eslint-disable-next-line eqeqeq
        if(TutorialModul.instance != undefined) throw new Error('no two allowed')
        this._event = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        this._flagService = GameServices.getService<FlagService>(FlagService.serviceName)
        this._log = GameServices.getService<LogService>(LogService.serviceName)
        this._log.debug('TutorialData',`Created`)
        this._event.subscribe(EventNames.periodChange,(caller, args)=>{
            let cLevel = this._flagService.getFlagInt(GameFlags.t_i_level)
            this.setTutorialStage(cLevel+1)
        })
    }

    private setTutorialStage(stage:number){
        this._log.debug('TutorialData',`Set tutorial Stage: ${stage}`)
        this._flagService.setFlag(GameFlags.t_i_level,stage)
    }
    
    public static RunTutorial(){
        // eslint-disable-next-line eqeqeq
        if(TutorialModul.instance == undefined){
            TutorialModul.instance = new TutorialModul()
        }
        console.log('game')



    }

}