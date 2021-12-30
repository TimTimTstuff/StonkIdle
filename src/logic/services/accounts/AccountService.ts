import { GlobalEvents } from "..";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { EventNames } from "../Config";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";

export class AccountService implements IGameService{
    
    public static serviceName = 'Account'
    private _saveService: SaveDataService
    private _event: GlobalEvents;

    constructor(saveService:SaveDataService, event:GlobalEvents) {
        this._saveService = saveService
        this._event = event
    }

    getServiceName(): string {
        return AccountService.serviceName
    }

    onPeriodUpdate() {
        let savingAccount = this._saveService.getGameSave().player.savingAccount
        if(savingAccount.interestForPeriods > 0){
            savingAccount.interestForPeriods--
            let interest = GameCalculator.roundValue((savingAccount.interest/100/100)*savingAccount.balance)
            this.addMainAccount(interest,'interest income')
        }
    }


    getMainToSaving(amount: number): boolean {
        if(!this.hasMainAmount(amount)){
            return false
        }

        return this.addSavingAccount(this.removeMainAccount(amount)?amount:0)
    }

    getSavingToMain(amount: number): boolean {
        if(!this.hasSavingsAmount(amount)){
            return false
        }

        return this.addMainAccount(this.removeSavingAccount(amount)?amount:0)
    }

    hasSavingsAmount(amount:number):boolean{
        return this._saveService.getGameSave().player.savingAccount.balance > amount
    }

    hasMainAmount(amount:number):boolean{
        return this._saveService.getGameSave().player.mainAccount.balance > amount
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
        this._event.callEvent(EventNames.moneyUpdate,this,{i:false, a:amount})
        return true
    }

    removeSavingAccount(amount:number, reason?:string):boolean {
        if(amount < 0) return false
        if(this._saveService.getGameSave().player.savingAccount.balance < amount){
            return false
        }
        this._saveService.getGameSave().player.savingAccount.balance -= amount
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Savings: -${amount}€ ${reason!==undefined?`Reason: ${reason}`:''}`, key:'out'})
        this._event.callEvent(EventNames.moneyUpdate,this,{})
        this._event.callEvent(EventNames.moneyUpdate,this,{i:false, a:amount})
        return true
    }

    addMainAccount(amount:number, reason?:string):boolean {
        this._saveService.getGameSave().player.mainAccount.balance += amount
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Main: ${amount}€ ${reason!==undefined?`Reason: ${reason}`:''}`, key:'income'})
        this._event.callEvent(EventNames.moneyUpdate,this,{i:true, a:amount})
        return true
    }

    addSavingAccount(amount:number, reason?:string):boolean {
        this._saveService.getGameSave().player.savingAccount.balance += amount
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Savings: ${amount}€ ${reason!==undefined?`Reason: ${reason}`:''}`, key:'income'})
        this._event.callEvent(EventNames.moneyUpdate,this,{i:true, a:amount})
        return true
    }

}