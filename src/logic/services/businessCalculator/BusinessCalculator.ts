import { GameServices, LogService } from "..";
import { Business, Potential } from "../../../model/Business";
import { MainSave } from "../../../model/MainSave";
import { StockPrice } from "../../../model/StockPrice";
import { BusinessHelper } from "../../module/business/BusinessHelper";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { GameConfig } from "../Config";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";
import { TimeService } from "../timeService/TimeService";

export class BusinessCalculator implements IGameService {
    
    
  
    private _timeService: TimeService;
      
    private _logService: LogService
    private _save: MainSave
    public static serviceName = 'BusinessCalculator';
    /**
     *
     */
    constructor(timeService:TimeService) {
        this._timeService = timeService
        this._logService = GameServices.getService<LogService>(LogService.serviceName)
        this._save = GameServices.getService<SaveDataService>(SaveDataService.serviceName).getGameSave()
        
        if(this._save.business === undefined || this._save.business.length === 0){

            this._save.business = [BusinessHelper.generateBusiness(), BusinessHelper.generateBusiness(), BusinessHelper.generateBusiness(), BusinessHelper.generateBusiness()]
        }
    }

    getMarketPerformance():number {
        return this._save.marketPotential
    }

    getAllBusiness() {
        return this._save.business;
    }

    onPeriodChange(){
        this._save.business.forEach(b => {
            this.updateBusiness(b.shortName)
            
            if(this.getSwitchPerformance()){
                let newM = BusinessHelper.getRandomPotential()
                b.potential = newM
                this._logService.debug(BusinessCalculator.serviceName, `Switch ${b.shortName} Potential to ${newM}`)
            }
        })

        if(this.getSwitchPerformance()){
                let newM = BusinessHelper.getRandomPotential()
                this._logService.debug(BusinessCalculator.serviceName, `Switch Market Potential to ${newM}`)
                this._save.marketPotential = newM
            }
        if((Math.random()*1000) > GameConfig.marketVolatilityChange){
            this._save.marketVolatility = BusinessHelper.getRandomVolatitlity()
            this._logService.debug(BusinessCalculator.serviceName, `Swith Volatility to: ${this._save.marketVolatility}`)
        }
    }

    private getSwitchPerformance() {
        let chance = 1000
        if(this._save.marketPotential == Potential.VeryLow || this._save.marketPotential == Potential.VeryHigh){
            chance = 1200
        }
        if(this._save.marketPotential == Potential.Low || this._save.marketPotential == Potential.High){
            chance = 1150
        }
        let erg = (Math.random()*(chance + this._save.marketVolatility))

        return erg > GameConfig.businessChangesPotential
    }

    getBusiness(shortname: string) : Business | undefined {
        return this._save.business.find(p => p.shortName === shortname)
    }

    getBusinessCurrentPrices(shortName: string): {b:number, s:number} {
        let cB = this.getBusiness(shortName)
        if(cB === undefined) return {b:0,s:0}

        let lastRecord = cB.stockPriceHistory[cB.stockPriceHistory.length -1]
        if(lastRecord == undefined) return {b:0, s:0}
        return {b: lastRecord.buyPrice, s: lastRecord.sellPrice}
    }

    getBusinessFirstPrice(shortName: string) {
        let cB = this.getBusiness(shortName)
        if(cB === undefined) return {b:0,s:0}

        let lastRecord = cB.stockPriceHistory[0]
        if(lastRecord == undefined) return {b:0, s:0}
        return {b: lastRecord.buyPrice, s: lastRecord.sellPrice}
    }

    getBusinessPrePrices(shortName: string) {
        let cB = this.getBusiness(shortName)
        if(cB === undefined) return {b:0,s:0}

        let lastRecord = cB.stockPriceHistory[cB.stockPriceHistory.length -2]
        if(lastRecord == undefined) return {b:0, s:0}
        return {b: lastRecord.buyPrice, s: lastRecord.sellPrice}
    }
    
    getServiceName(): string {
        return BusinessCalculator.serviceName
    }

    cleanBusinessHistory(business: Business){
        let toRemove = business.stockPriceHistory.length - GameConfig.businessChartMaxPoints
        if(toRemove > 0){
            for(let i = 0; i < toRemove; i++){
                business.stockPriceHistory.shift()
            }
        }
    }

    private addStockPriceHistory(business:Business, price:StockPrice) {
        business.stockPriceHistory.push(price)
        let timeKey = this._timeService.getFormated(GameConfig.CicleHistoryDateFormat,this._timeService.getTicks())
        let ageKey = this._timeService.getFormated(GameConfig.AgeHistoryDateFormat,this._timeService.getTicks())
        //circle log
        if(business.historyCicle[timeKey] == undefined){
            business.historyCicle[timeKey] = {
                start: price.sellPrice,
                end: price.sellPrice,
                high: price.sellPrice,
                low: price.sellPrice
            }
        }else{
            let bb = business.historyCicle[timeKey]
            if(bb.high < price.sellPrice) bb.high = price.sellPrice
            if(bb.low > price.sellPrice) bb.low = price.sellPrice
            bb.end = price.sellPrice
        }
        //age log
        if(business.historyAge[ageKey] == undefined){
            business.historyAge[ageKey] = {
                start: price.sellPrice,
                end: price.sellPrice,
                high: price.sellPrice,
                low: price.sellPrice
            }
        }else{
            let bb = business.historyAge[ageKey]
            if(bb.high < price.sellPrice) bb.high = price.sellPrice
            if(bb.low > price.sellPrice) bb.low = price.sellPrice
            bb.end = price.sellPrice
        }
    }

    updateBusiness(shortName:string):void {
        let cB = this._save.business.find((p) => p.shortName === shortName)
        if(cB === undefined){
            this._logService.warn(this.getServiceName(),`Can't find Business: ${shortName}`)
            return;
        }
        let current = this.getBusinessCurrentPrices(shortName)
        if(current.s == 0) {current.s +=1;current.s +=1}

        let sellPrice = GameCalculator.roundValue(GameCalculator.getRangeWitWeight(current.s, cB.potential,this._save.marketPotential),3)
        let buyPrice = GameCalculator.roundValue(sellPrice*GameConfig.getBaseSpread,3)
        this.addStockPriceHistory(cB, {
            buyPrice:buyPrice,
            date:GameServices.getService<TimeService>(TimeService.serviceName).getTicks(), 
            sellPrice:sellPrice})
        
        this.cleanBusinessHistory(cB);
    }
}