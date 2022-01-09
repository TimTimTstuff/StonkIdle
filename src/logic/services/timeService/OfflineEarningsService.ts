import { GlobalEvents } from "..";
import { GameFormating } from "../../module/calculator/GameFormating";
import { EventNames, GameFlags } from "../Config";
import { IGameService } from "../IGameService";
import { FlagService } from "../saveData/FlagService";
import { SaveDataService } from "../saveData/SaveDataService";

export class OfflineEarningsService implements IGameService{
    
    //#region service
    public static serviceName:string = 'OfflineEarningsService'
    private _event: GlobalEvents;
    private _flag: FlagService;
    private _save: SaveDataService;
    getServiceName(): string {
        return OfflineEarningsService.serviceName
    }

    constructor(event:GlobalEvents, flag:FlagService, save:SaveDataService) {
        this._event = event
        this._flag = flag
        this._save = save
    }
    
    public processOfflineTime(){

        let secondsSinceLast = this._save.getGameSave().lastSave
        let secondsNow = new Date().getTime()
        let diffMinutes = GameFormating.roundDown((secondsNow - secondsSinceLast)/1000/60,0)
        let diffHours = GameFormating.roundDown(diffMinutes/60)
        let diffDays = GameFormating.roundDown(diffHours/24)
        if(diffMinutes > 2 ){
           this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Offline for: ${diffDays} Days or ${diffHours} Hours or ${diffMinutes} Minutes. You got offline Earnings!`})
           this._flag.addToFlag(GameFlags.o_i_minutes,GameFormating.roundDown(diffMinutes/2))
           this._flag.addToFlag(GameFlags.o_i_hours,diffHours)
           this._flag.addToFlag(GameFlags.o_i_days,diffDays)
        }

    }
}