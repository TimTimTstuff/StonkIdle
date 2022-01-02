import { GlobalEvents, LogService } from "..";
import { ItemType, StoreItem } from "../../../model/StoreItem";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { AccountService } from "../accounts/AccountService";
import { GameStats, GameStatsMethod, StatsService } from "../accounts/StatsService";
import { EventNames, GameFlags } from "../Config";
import { IGameService } from "../IGameService";
import { FlagService } from "../saveData/FlagService";
import { SaveDataService } from "../saveData/SaveDataService";
import { StoreItemGenerator } from "./StoreItemGenerator";

export class StoreManager implements IGameService {
    //#region service
    public static serviceName: string = 'StoreManager'
    getServiceName(): string {
        return StoreManager.serviceName
    }
    //#endregion

    //#region fields
    private _log: LogService;
    private _account: AccountService;
    private _stats: StatsService;
    private _flag: FlagService;
    private _save: SaveDataService;
    private _event: GlobalEvents
    //#endregion

    constructor(log:LogService, account:AccountService, flag:FlagService, stats:StatsService, save:SaveDataService, event:GlobalEvents) {
        this._log = log
        this._account = account
        this._flag = flag
        this._stats = stats
        this._save = save
        this._event = event
        
        this._event.subscribe(EventNames.periodChange,(caller, args)=>{
            this.cleanupShop()
            this.addNewItem()
        })
    }
    
    buyItem(id:string){
        let item = this.getItems().find(a => a.id === id)
        if(item === undefined || !this._account.hasMainAmount(item.price)) return
        
        this._stats.setStat(GameStats.ItemsBought,1,GameStatsMethod.Add)
        this._stats.setStat(GameStats.SpendOnItems,item.price,GameStatsMethod.Add)
        if(this._account.removeMainAccount(item.price)){
            this._account.addToTaxLogBuyItem(item.price)
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Store: Item ${item.title} was bought for ${GameCalculator.roundValueToEuro(item.price)}`})
            this.processItem(item)
            item.avaliableTicks = 0
        }
        
    }
    processItem(item: StoreItem) {
        switch(item.itemType){
            case ItemType.ChangeInterestRuntime:
                this._account.addSavingInterestPeriods(item.effect.value)
                this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Interest Period was extended by ${item.effect.value} Periods`})
                break;
            default:
                this._log.warn(StoreManager.serviceName, `Item whitout processing Logic!`,item)
                break;
        }
    }

    addNewItem() {
       if(GameCalculator.checkChance(this._flag.getFlagInt(GameFlags.s_i_itemChance)) && this._flag.getFlagInt(GameFlags.s_i_maxItems) > this.getItems().length){
          this.addItem(StoreItemGenerator.generateInterestPeriodExtension())
       }
    }

    cleanupShop() {
        this.getItems().forEach(i => {
            i.avaliableTicks -= 100
        })

       this.getItems().filter(a => a.avaliableTicks <= 0).forEach((v,i,a) =>{
           this.removeItem(i)
       })
    }

    removeItem(index:number){
        this._save.getGameSave().store.splice(index,1)
    }

    addItem(item:StoreItem):void {
        this._save.getGameSave().store.push(item)
    }

    getItems():StoreItem[]{
        return this._save.getGameSave().store;
    }
}