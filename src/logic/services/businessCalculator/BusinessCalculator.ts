import { GameServices, LogService } from "..";
import { Business, HistorySlice, MarketVolatility, Potential } from "../../../model/Business";
import { MainSave } from "../../../model/MainSave";
import { StockPrice } from "../../../model/StockPrice";
import { BusinessHelper } from "../../module/business/BusinessHelper";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { GameRandom } from "../../module/calculator/GameRandom";
import { GameConfig, GameFlags } from "../Config";
import { IGameService } from "../IGameService";
import { FlagService } from "../saveData/FlagService";
import { SaveDataService } from "../saveData/SaveDataService";
import { TimeService } from "../timeService/TimeService";

export class BusinessCalculator implements IGameService {

    //#region Fields
    private _timeService: TimeService;
    private _logService: LogService
    private _save: MainSave
    private _flag: FlagService
    public static serviceName = 'BusinessCalculator';
    //#endregion

    //#region ctor
    constructor(timeService: TimeService, flag: FlagService) {
        this._timeService = timeService
        this._logService = GameServices.getService<LogService>(LogService.serviceName)
        this._save = GameServices.getService<SaveDataService>(SaveDataService.serviceName).getGameSave()
        this._flag = flag
        if (this._save.business === undefined || this._save.business.length === 0) {
            this._save.business = [
                BusinessHelper.generateBusiness(), 
                BusinessHelper.generateBusiness(), 
                BusinessHelper.generateBusiness(), 
                BusinessHelper.generateBusiness(),
                BusinessHelper.generateBusiness(),
                BusinessHelper.generateBusiness(),
                BusinessHelper.generateBusiness(),
            ]
        }
    }
    //#endregion

    //#region market information
    getMarketVolatility(): MarketVolatility {
        return this._save.marketVolatility
    }

    getMarketPerformance(): number {
        return this._save.marketPotential
    }

    getServiceName(): string {
        return BusinessCalculator.serviceName
    }
    //#endregion
    
    //#region Find Business
    getBusiness(shortname: string): Business | undefined {
        return this._save.business.find(p => p.shortName === shortname)
    }

    getAllBusiness() {
        return this._save.business;
    }
    //#endregion

    //#region gameUpdate
    onCicleChange() {

        this._save.business.forEach(b =>{
            b.basePotential = GameRandom.randomEnum(Potential)
        })
    }

    onPeriodChange() {
        this._save.business.forEach(b => {
            this.updateBusiness(b.shortName)

            if (this.getSwitchPerformance()) {
                let newM = BusinessHelper.getRandomPotential()
                b.potential = newM
                this._logService.debug(BusinessCalculator.serviceName, `Switch ${b.shortName} Potential to ${newM}`)
            }
        })

        if (this.getSwitchPerformance()) {
            let newM = BusinessHelper.getRandomPotential()
            this._logService.debug(BusinessCalculator.serviceName, `Switch Market Potential to ${newM}`)
            this._save.marketPotential = newM
        }
        if ((Math.random() * 1000) > GameConfig.marketVolatilityChange) {
            this._save.marketVolatility = BusinessHelper.getRandomVolatitlity()
            this._logService.debug(BusinessCalculator.serviceName, `Swith Volatility to: ${this._save.marketVolatility}`)
        }
    }

    updateBusiness(shortName: string): void {
        let cB = this._save.business.find((p) => p.shortName === shortName)
        if (cB === undefined) {
            this._logService.warn(this.getServiceName(), `Can't find Business: ${shortName}`)
            return;
        }
        let current = this.getBusinessCurrentPrices(shortName)
        if (current.s == 0) { current.s += 1; current.s += 1 }
        let sellPrice = GameCalculator.roundValue(GameCalculator.calculateBusinessSellPrice(cB,current.s,this.getMarketPerformance()))
        this.tweakPotential(sellPrice, cB);
        //let sellPrice = GameCalculator.roundValue(GameCalculator.getRangeWitWeight(current.s, cB.potential, this._save.marketPotential), 3)
        let buyPrice = GameCalculator.roundValue(sellPrice * (1+(this._flag.getFlagFloat(GameFlags.g_f_shareSpread)/1000)), 3)
        this.addStockPriceHistory(cB, {
            buyPrice: buyPrice,
            date: GameServices.getService<TimeService>(TimeService.serviceName).getTicks(),
            sellPrice: sellPrice
        })

        this.cleanBusinessHistory(cB);
    }
    private tweakPotential(sellPrice: number, cB: Business) {
        
        if(sellPrice > 800){
            cB.basePotential = Potential.VeryLow
        }else if (sellPrice > 500) {
            cB.basePotential = Potential.Low;
        }else if (cB.basePotential < Potential.Medium && sellPrice < 10) {
            cB.basePotential = Potential.High;
        }else if(sellPrice < 1){
            cB.basePotential = Potential.VeryHigh
        }
    }

    //#endregion

    //#region Prices
    getBusinessCurrentPrices(shortName: string): { b: number, s: number } {
        let cB = this.getBusiness(shortName)
        if (cB === undefined) return { b: 0, s: 0 }

        let lastRecord = cB.stockPriceHistory[cB.stockPriceHistory.length - 1]
        if (lastRecord == undefined) return { b: 0, s: 0 }
        return { b: lastRecord.buyPrice, s: lastRecord.sellPrice }
    }

    getBusinessFirstPrice(shortName: string) {
        let cB = this.getBusiness(shortName)
        if (cB === undefined) return { b: 0, s: 0 }

        let lastRecord = cB.stockPriceHistory[0]
        if (lastRecord == undefined) return { b: 0, s: 0 }
        return { b: lastRecord.buyPrice, s: lastRecord.sellPrice }
    }

    getBusinessPrePrices(shortName: string) {
        let cB = this.getBusiness(shortName)
        if (cB === undefined) return { b: 0, s: 0 }

        let lastRecord = cB.stockPriceHistory[cB.stockPriceHistory.length - 2]
        if (lastRecord == undefined) return { b: 0, s: 0 }
        return { b: lastRecord.buyPrice, s: lastRecord.sellPrice }
    }
    //#endregion

    //#region history
    getCurrentAgeForBusiness(currentBusiness: string):HistorySlice {
        let cA = this._timeService.getCurrentAge()
        return (this.getBusiness(currentBusiness) as Business).historyAge[cA]
    }
    getCurrentCicleForBusiness(currentBusiness: string) {
        let cC = this._timeService.getCurrentCicle()
        return (this.getBusiness(currentBusiness) as Business).historyCicle[cC]
    }
    //#endregion

    //#region Private
    private getSwitchPerformance() {
        let chance = 1000
        if (this._save.marketPotential == Potential.VeryLow || this._save.marketPotential == Potential.VeryHigh) {
            chance = 1200
        }
        if (this._save.marketPotential == Potential.Low || this._save.marketPotential == Potential.High) {
            chance = 1150
        }
        let erg = (Math.random() * (chance + this._save.marketVolatility))

        return erg > GameConfig.businessChangesPotential
    }

    private cleanBusinessHistory(business: Business) {
        let toRemove = business.stockPriceHistory.length - GameConfig.businessChartMaxPoints
        if (toRemove > 0) {
            for (let i = 0; i < toRemove; i++) {
                business.stockPriceHistory.shift()
            }
        }
    }

    private addStockPriceHistory(business: Business, price: StockPrice) {
        business.stockPriceHistory.push(price)
        let timeKey = this._timeService.getFormated(GameConfig.CicleHistoryDateFormat, this._timeService.getTicks())
        let ageKey = this._timeService.getFormated(GameConfig.AgeHistoryDateFormat, this._timeService.getTicks())
        //circle log
        if (business.historyCicle[timeKey] == undefined) {
            business.historyCicle[timeKey] = {
                start: price.sellPrice,
                end: price.sellPrice,
                high: price.sellPrice,
                low: price.sellPrice
            }
        } else {
            let bb = business.historyCicle[timeKey]
            if (bb.high < price.sellPrice) bb.high = price.sellPrice
            if (bb.low > price.sellPrice) bb.low = price.sellPrice
            bb.end = price.sellPrice
        }
        //age log
        if (business.historyAge[ageKey] == undefined) {
            business.historyAge[ageKey] = {
                start: price.sellPrice,
                end: price.sellPrice,
                high: price.sellPrice,
                low: price.sellPrice
            }
        } else {
            let bb = business.historyAge[ageKey]
            if (bb.high < price.sellPrice) bb.high = price.sellPrice
            if (bb.low > price.sellPrice) bb.low = price.sellPrice
            bb.end = price.sellPrice
        }
    }
    //#endregion

}