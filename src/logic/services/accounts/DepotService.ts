import { GlobalEvents } from "..";
import { GameLogCategories } from "../../../components/InfoComponents/GameLog";
import { DepotData } from "../../../model/AccountData";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { BusinessCalculator } from "../businessCalculator/BusinessCalculator";
import { EventNames } from "../Config";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";
import { AccountService } from "./AccountService";
import { GameStats, GameStatsMethod, StatsService } from "./StatsService";

export class DepotService implements IGameService {
    public static serviceName: string
    private _save: SaveDataService
    private _business: BusinessCalculator
    private _account: AccountService
    private _event: GlobalEvents
    private _stats: StatsService
    
    constructor(saveManager: SaveDataService, business: BusinessCalculator, accountService: AccountService, event: GlobalEvents, stats:StatsService) {
        this._save = saveManager
        this._business = business
        this._account = accountService
        this._event = event
        this._stats = stats
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

    getDepotValueByCompanyName(shortName:string):number{
        return ((this.getDepotByCompanyName(shortName)?.shareAmount??0) * this._business.getBusinessCurrentPrices(shortName).s)
    }

    getDepotBuySellDiff(shortName: string):number{
        let price = this._business.getBusinessCurrentPrices(shortName).s
        let depot = this.getDepotByCompanyName(shortName)?.buyIn??0
        
        return price - depot
    }

    getDepotTotalValue(): number{
        let totalValue = 0
        this._business.getAllBusiness().forEach(b=>{
            totalValue += this.getDepotValueByCompanyName(b.shortName)
        })

        return totalValue
    }

    sellStock(shortName:string, amount:number){
        let b = this._business.getBusinessCurrentPrices(shortName)
        let depot = this.getDepotByCompanyName(shortName)
        let business = this._business.getBusiness(shortName)
        let sellPrice =  GameCalculator.roundValue(b.s*amount)

        if(business == undefined || depot == undefined){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Can't find stock: ${shortName}`, key:'error', cat:GameLogCategories.Depot})
            return false
        }

        if(depot.shareAmount < amount){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough shares owned to sell ${shortName} - ${amount}pc (${depot.shareAmount} owned)`, key:'error', cat:GameLogCategories.Depot})
            return false
        }

        business.floatingStock += amount
        
        this._stats.setStat(GameStats.SharesSellQuantity, amount, GameStatsMethod.Add)
        this._account.addMainAccount(sellPrice)
        this._account.addToTaxLogSellStock(sellPrice)
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Soled ${shortName} - ${amount}pc (${sellPrice}€ / ${b.b}€/pc)`, key:'buy', cat:GameLogCategories.Depot})
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
        
        this._stats.setStat(GameStats.SharesSellAmount, sellPrice, GameStatsMethod.Add)
        this.recalculateStockAmount(shortName)
        return true

    }

    buyStock(shortName:string, amount:number): boolean{
        let b = this._business.getBusinessCurrentPrices(shortName)
        let depot = this.getDepotByCompanyName(shortName)
        let business = this._business.getBusiness(shortName)
        let buyPrice = GameCalculator.roundValue(b.b*amount)
        
        if(business == undefined || depot == undefined){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Can't find stock: ${shortName}`, key:'error', cat:GameLogCategories.Depot})
            return false
        }
        
        if(this._account.getMainAccountBalance() < buyPrice){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough funding to buy ${shortName} - ${amount}pc (${buyPrice} needed)`, key:'error', cat:GameLogCategories.Depot})
            return false
        };

        if(business.floatingStock < amount){
            this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough free stocks to buy ${shortName} - ${amount}pc (${business?.floatingStock} avaliable)`, key:'error', cat:GameLogCategories.Depot})
            return false
        }

        business.floatingStock -= amount
        this._account.removeMainAccount(buyPrice)
        this._account.addToTaxLogBuyStock(buyPrice)
        depot.transactions.push({sN:shortName, sA:amount, iS:false, sP:b.b})
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Bought ${shortName} - ${amount}pc (${buyPrice}€ / ${b.b}€/pc)`, key:'buy', cat:GameLogCategories.Depot})
        this._stats.setStat(GameStats.SharesBuyQuantity, amount, GameStatsMethod.Add)
        this._stats.setStat(GameStats.SharesBuyAmount, buyPrice, GameStatsMethod.Add)
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