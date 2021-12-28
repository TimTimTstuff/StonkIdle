import { GlobalEvents } from "../../services";
import { EventNames } from "../../services/Config";
import { IGameService } from "../../services/IGameService";
import { SaveDataService } from "../../services/saveData/SaveDataService";

export class Account implements IGameService{
  
    public static serviceName = 'Account'
    private _saveService: SaveDataService
    private _event: GlobalEvents;

    constructor(saveService:SaveDataService, event:GlobalEvents) {
        this._saveService = saveService
        this._event = event
    }

    getServiceName(): string {
        return Account.serviceName
    }

    onPeriodUpdate() {

        
        let savingAccount = this._saveService.getGameSave().player.savingAccount
        if(savingAccount.interestForPeriods > 0){
            savingAccount.interestForPeriods--
            let interest = Math.round(((savingAccount.interest/100/100)*savingAccount.balance)*100)/100
            this.addSavingAccount(interest,'interest income')
        }
    }

    getSavingInterest(): number {
        return this._saveService.getGameSave().player.savingAccount.interest
    }

    getSavingInterestLeft(): number {
        return this._saveService.getGameSave().player.savingAccount.interestForPeriods
    }

    getSavingBalance(): number {
        return this._saveService.getGameSave().player.savingAccount.balance
    }

    getMainAccountBalance(): number {
        return this._saveService.getGameSave().player.mainAccount.balance
    }

    removeMainAccount(amount:number, reason?:string):boolean {
        if(amount < 0) return false
        if(this._saveService.getGameSave().player.mainAccount.balance < amount){
            return false
        }
        this._saveService.getGameSave().player.mainAccount.balance -= amount
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Main: -${amount}€ ${reason!==undefined?`Reason: ${reason}`:''}`, key:'out'})
        return true
    }

    removeSavingAccount(amount:number, reason?:string):boolean {
        if(amount < 0) return false
        if(this._saveService.getGameSave().player.savingAccount.balance < amount){
            return false
        }
        this._saveService.getGameSave().player.savingAccount.balance -= amount
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Savings: -${amount}€ ${reason!==undefined?`Reason: ${reason}`:''}`, key:'out'})
        return true
    }

    addMainAccount(amount:number, reason?:string):boolean {
        if(this._saveService.getGameSave().player.mainAccount.balance < amount){
            return false
        }
        this._saveService.getGameSave().player.mainAccount.balance += amount
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Main: ${amount}€ ${reason!==undefined?`Reason: ${reason}`:''}`, key:'income'})
        return true
    }

    addSavingAccount(amount:number, reason?:string):boolean {
        if(this._saveService.getGameSave().player.savingAccount.balance < amount){
            return false
        }
        this._saveService.getGameSave().player.savingAccount.balance += amount
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Savings: ${amount}€ ${reason!==undefined?`Reason: ${reason}`:''}`, key:'income'})
        return true
    }

}