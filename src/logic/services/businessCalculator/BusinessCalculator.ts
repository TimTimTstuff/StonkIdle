import { GameServices, LogService } from "..";
import { Business, Potential } from "../../../model/Business";
import { MainSave } from "../../../model/MainSave";
import { BusinessHelper } from "../../module/business/BusinessHelper";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { GameConfig } from "../Config";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";
import { TimeService } from "../timeService/TimeService";

export class BusinessCalculator implements IGameService {
    getAllBusiness() {
        return this._save.business;
    }
   
    private _logService: LogService
    private _save: MainSave
    public static serviceName = 'BusinessCalculator';
    /**
     *
     */
    constructor() {
        this._logService = GameServices.getService<LogService>(LogService.serviceName)
        this._save = GameServices.getService<SaveDataService>(SaveDataService.serviceName).getGameSave()
        
        if(this._save.business === undefined || this._save.business.length == 0){

            this._save.business = [BusinessHelper.generateBusiness(), BusinessHelper.generateBusiness(), BusinessHelper.generateBusiness(), BusinessHelper.generateBusiness()]
        }
    }

    onPeriodChange(){
        this._save.business.forEach(b => {
            this.updateBusiness(b.shortName)
        })
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

    updateBusiness(shortName:string):void {
        let cB = this._save.business.find((p) => p.shortName === shortName)
        if(cB === undefined){
            this._logService.warn(this.getServiceName(),`Can't find Business: ${shortName}`)
            return;
        }
        let current = this.getBusinessCurrentPrices(shortName)
        if(current.s == 0) {current.s +=1;current.s +=1}
        let sellPrice = GameCalculator.getRangeWitWeight(current.s, Potential.Medium)
        let buyPrice = sellPrice*1.012
        cB.stockPriceHistory.push({
            buyPrice:buyPrice,
            date:GameServices.getService<TimeService>(TimeService.serviceName).getTicks(), 
            sellPrice:sellPrice})
        this.cleanBusinessHistory(cB);
    }
}