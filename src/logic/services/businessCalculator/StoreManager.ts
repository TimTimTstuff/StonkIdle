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
            let info = args as {o:number, n:number} 
            if(info == null || info.o == undefined || info.n == undefined)
                return

            this.onPeriodUpdate();
        })
    }
    
    private onPeriodUpdate() {
        this.getItems().forEach(i => {
            i.avaliableTicks -= 100;
            if(i.avaliableTicks <= 0){
                this._save.getGameSave().store.splice(this._save.getGameSave().store.indexOf(i))
            }
        });

        this.addNewItem();
    }

    buyItem(id:string){
        let item = this.getItems().find(a => a.id === id)
        if(item === undefined || !this._account.hasMainAmount(item.price)) return
        
        this._stats.setStat(GameStats.ItemsQuantity,1,GameStatsMethod.Add)
        this._stats.setStat(GameStats.ItemsAmount,item.price,GameStatsMethod.Add)
        if(this._account.removeMainAccount(item.price)){
            this._account.addToTaxLogBuyItem(item.price)
            this._event.callEvent(EventNames.AddLogMessage,this,{key:'info',msg:`Store: Item ${item.title} was bought for ${GameCalculator.roundValueToEuro(item.price)}`})
            this.processItem(item)
            item.avaliableTicks = 0
            this._save.getGameSave().store.splice(this._save.getGameSave().store.indexOf(item),1)
            this._event.callEvent(EventNames.periodChange,this,{})
        }
        
    }
    processItem(item: StoreItem) {
        switch(item.itemType){
            case ItemType.ChangeInterestRuntime:
                this._account.addSavingInterestPeriods(item.effect.value)
                this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Interest Period was extended by ${item.effect.value} Periods`, key:'info'})
                break;
            case ItemType.LotteryTicket:
                let chance = GameCalculator.roundValue(Math.random()*1000,0)
                let win = chance > 970
                let msg = `You got a ${chance}. Beat 970 to win!`
                let price = GameCalculator.roundValue(this._account.getSavingBalance()/8)
                if(win){
                    msg = `Booom. You got a ${chance} which is a Win. You gain: ${price}€`
                    this._account.addMainAccount(price,'Lottery Win')
                }
                this._event.callEvent(EventNames.AddLogMessage,this,{key:win?'goal':'info', msg:msg})
                break;
            default:
                this._log.warn(StoreManager.serviceName, `Item whitout processing Logic!`,item)
                break;
        }
    }

    addNewItem() {

       if(GameCalculator.checkChance(this._flag.getFlagInt(GameFlags.s_i_itemChance)) && this._flag.getFlagInt(GameFlags.s_i_maxItems) > this.getItems().length){
          
            let chance = Math.random()*1000

            if(chance > 500){
                this.addItem(StoreItemGenerator.itemGenerator_PeriodExtension())
            }else{
                this.addItem(StoreItemGenerator.itemGenerator_Jackpot())
            }
            
       }
    }

    addItem(item:StoreItem):void {
        this._save.getGameSave().store.push(item)
    }

    getItems():StoreItem[]{
        return this._save.getGameSave().store;
    }
}