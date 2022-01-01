import { stat } from "fs";
import { LogService } from "..";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";
import { TimeService } from "../timeService/TimeService";








export enum GameStats {
    BuyedSharesTotal = 0,
    SellForShare = 1,
    Interest = 2,
    HighestMainAccount = 3,
    PayedForTax = 4,
    SellPriceTotal = 5,
    BuyPriceTotal = 6,
    HighestSavingAccount = 7
}

export enum GameStatsMethod{
    Overwrite,
    Add,
    OverwriteIfHigher,
}

export class StatsService implements IGameService{

    public static serviceName: string = 'StatsService'
    private _time: TimeService;
    private _save: SaveDataService;
    private _log: LogService;

    constructor(time: TimeService, save: SaveDataService, log:LogService) {
        this._time = time
        this._save = save
        this._log = log
    }

    getServiceName(): string {
       return StatsService.serviceName
    }

    public setStat(stat:GameStats, amount:number, method:GameStatsMethod ){
        if(this._save.getGameSave().stats[stat] == undefined){
            this._save.getGameSave().stats[stat] = 0
        }

        switch(method){
            case GameStatsMethod.Overwrite:
                this._save.getGameSave().stats[stat] = amount
                break;
            case GameStatsMethod.Add:
                this._save.getGameSave().stats[stat] += amount
                break;
            case GameStatsMethod.OverwriteIfHigher:
                let statVal = this._save.getGameSave().stats[stat];
                if(statVal < amount) this._save.getGameSave().stats[stat] = amount
                break;
            default:
                this._log.debug(StatsService.serviceName, `Can't find Method: ${method}`)
                break;
        }

    }

    public getStat(stat:GameStats):number{
        if(this._save.getGameSave().stats[stat] == undefined){
            this._save.getGameSave().stats[stat] = 0
        }

        return this._save.getGameSave().stats[stat]
    }


}