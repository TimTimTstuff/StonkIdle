import { GlobalEvents } from "..";
import { DepotData } from "../../../model/AccountData";
import { GameCalculator } from "../../module/calculator/GameCalculator";
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
            depot = {shareAmount:0, shareName: shortName, transactions: [],buyIn:0}
            this._save.getGameSave().player.depots.push(depot)
        }
        return depot;
    }

    sellStock(shortName:string, amount:number){
        let b = this._business.getBusinessCurrentPrices(shortName)
        let depot = this.getDepotByCompanyName(shortName)
        let business = this._business.getBusiness(shortName)
        let sellPrice =  GameCalculator.roundValue(b.s*amount)

        if(business == undefined || depot == undefined){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Can't find stock: ${shortName}`, key:'error'})
            return false
        }

        if(depot.shareAmount < amount){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough shares owned to sell ${shortName} - ${amount}pc (${depot.shareAmount} owned)`, key:'error'})
            return false
        }

        business.floatingStock += amount
        this._account.addMainAccount(sellPrice)
        this._account.addToTaxLogSellStock(sellPrice)
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Soled ${shortName} - ${amount}pc (${sellPrice}€ / ${b.b}€/pc)`, key:'buy'})
        depot.transactions.forEach(t => {
            if(t.sA <= 0 || amount === 0) return

            if(t.sA >= amount){
                t.sA -= amount
                amount = 0
            }else{
                amount -= t.sA
                t.sA = 0
            }
        })
        this.recalculateStockAmount(shortName)
        return true

    }

    buyStock(shortName:string, amount:number): boolean{
        let b = this._business.getBusinessCurrentPrices(shortName)
        let depot = this.getDepotByCompanyName(shortName)
        let business = this._business.getBusiness(shortName)
        let buyPrice = GameCalculator.roundValue(b.b*amount)
        
        if(business == undefined || depot == undefined){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Can't find stock: ${shortName}`, key:'error'})
            return false
        }
        
        if(this._account.getMainAccountBalance() < buyPrice){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough funding to buy ${shortName} - ${amount}pc (${buyPrice} needed)`, key:'error'})
            return false
        };

        if(business.floatingStock < amount){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough free stocks to buy ${shortName} - ${amount}pc (${business?.floatingStock} avaliable)`, key:'error'})
            return false
        }

        business.floatingStock -= amount
        this._account.removeMainAccount(buyPrice)
        this._account.addToTaxLogBuyStock(buyPrice)
        depot.transactions.push({sN:shortName, sA:amount, iS:false, sP:b.b})
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Bought ${shortName} - ${amount}pc (${buyPrice}€ / ${b.b}€/pc)`, key:'buy'})
        this.recalculateStockAmount(shortName)
        return true
    }

    private recalculateStockAmount(shortName:string){
        let depot = this.getDepotByCompanyName(shortName)
        let b = this._business.getBusiness(shortName)
        if(depot == undefined || b == undefined) return
        let totalOwned = 0
        let totalBuyPrice = 0
        depot.transactions.forEach(d =>{ 
            totalOwned += !d.iS?d.sA:0
            totalBuyPrice += !d.iS?(d.sP*d.sA):0
        })
        depot.shareAmount = totalOwned
        //b.floatingStock -= totalOwned
        depot.buyIn = GameCalculator.roundValue(totalBuyPrice / totalOwned)
        depot.transactions = depot.transactions.filter(a => a.iS === false && a.sA > 0)       
    }
    
}