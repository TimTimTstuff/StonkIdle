import { GlobalEvents } from "..";
import { DepotData } from "../../../model/AccountData";
import { BusinessCalculator } from "../businessCalculator/BusinessCalculator";
import { EventNames } from "../Config";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";
import { AccountService } from "./AccountService";

export class DepotService implements IGameService {
    public static serviceName: string
    private _save: SaveDataService
    private _business: BusinessCalculator
    private _account: AccountService
    private _event: GlobalEvents
    
    
    /**
     *
     */
    constructor(saveManager: SaveDataService, business: BusinessCalculator, accountService: AccountService, event: GlobalEvents) {
        this._save = saveManager
        this._business = business
        this._account = accountService
        this._event = event
    }

    getServiceName(): string {
        return DepotService.serviceName
    }

    getDepotByCompanyName(shortName:string):DepotData | undefined {
        let depot = this._save.getGameSave().player.depots.find(a => a.shareName === shortName)
        if(depot === undefined) {
            let existingBusiness = this._business.getBusiness(shortName)
            if(existingBusiness === undefined) return undefined
            depot = {shareAmount:0, shareName: shortName, transactions: []}
            this._save.getGameSave().player.depots.push(depot)
        }
        return depot;
    }

    buyStock(shortName:string, amount:number): boolean{
        let b = this._business.getBusinessCurrentPrices(shortName)
        let depot = this.getDepotByCompanyName(shortName)
        let business = this._business.getBusiness(shortName)
        let buyPrice = b.b*amount
        if(business == undefined || depot == undefined){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Can't find stock: ${shortName}`, key:'error'})
            return false
        }
        if(this._account.getMainAccountBalance() < buyPrice){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough funding to buy ${shortName} - ${amount}pc (${buyPrice} needed)`, key:'error'})
            return false
        };
        if(business?.floatingStock??0 < amount){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough free stocks to buy ${shortName} - ${amount}pc (${business?.floatingStock} avaliable)`, key:'error'})
            return false
        }

        business.floatingStock -= amount
        this._account.removeMainAccount(buyPrice)
        depot.transactions.push({shareName:shortName, shareAmount:amount, isSell:false, moneyAmount:buyPrice})
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Bought ${shortName} - ${amount}pc (${buyPrice}€ / ${b.b}€/pc)`, key:'error'})

        return true
    }
    
}