import { IGameService } from "../IGameService";
import { SaveDataService } from "./SaveDataService";

export class FlagService implements IGameService{
    public static serviceName:string = 'FlagService'
    private _save: SaveDataService;
    
    constructor(save: SaveDataService) {
        this._save = save    
    }

    public setFlag(flag:string, value:string|number|boolean){
        this._save.getGameSave().flags[flag] = value
    }

    public addToFlag(flag:string, value:string|number){
        (this._save.getGameSave().flags[flag] as any) += value
    }

    public getFlagString(flag:string):string{
        let v = this._save.getGameSave().flags[flag]
        if(v == undefined) return ''
        return v.toString()
    }

    public getFlagBool(flag:string):boolean{
        let v = this._save.getGameSave().flags[flag]
        if(v == undefined) return false
        return v === true
    }

    public getFlagInt(flag:string):number{
        let v = this._save.getGameSave().flags[flag]
        if(v == undefined) return 0
        if(isNaN(v as number)){
            return parseInt(v as string)
        }
        return Math.round(v as number)
    }

    public getFlagFloat(flag:string):number{
        let v = this._save.getGameSave().flags[flag]
        if(v == undefined) return 0
        if(isNaN(v as number)){
            return parseFloat(v as string)
        }
        
        return v as number
    }



    getServiceName(): string {
        return FlagService.serviceName
    }
}