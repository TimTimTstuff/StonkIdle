import { GameServices, GlobalEvents, LogService } from "..";
import { Business } from "../../../model/Business";
import { MainSave } from "../../../model/MainSave";
import { StockPriceKeyPoint } from "../../../model/StockPrice";
import { GameConfig } from "../Config";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";
import { TimeService } from "../timeService/TimeService";

export class BusinessCalculator implements IGameService {
    getAllBusiness() {
        return this._save.business;
    }
   
    private _eventService: GlobalEvents
    private _logService: LogService
    private _save: MainSave
    public static serviceName = 'BusinessCalculator';
    /**
     *
     */
    constructor() {
        this._eventService = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        this._logService = GameServices.getService<LogService>(LogService.serviceName)
        this._save = GameServices.getService<SaveDataService>(SaveDataService.serviceName).getGameSave()
        
        if(this._save.business === undefined || this._save.business.length == 0){
            this._save.business = [{totalStock:10000, name:'Test Comp A', floatingStock:1000, shortName:'AAA', stockPriceHistory:[]},{totalStock:10000, name:'Test Comp B', floatingStock:1000, shortName:'BBB', stockPriceHistory:[]}]
        }

        if(this._save.business.length === 0){
            this.addBusiness("A")
        }

        this._eventService.subscribe('changePeriod',(caller,args) =>{
            this._save.business.forEach(b => {
                this.updateBusiness(b.shortName)
            })
        })
    }

    getBusiness(shortname: string) : Business | undefined {
        return this._save.business.find(p => p.shortName === shortname)
    }
    
    getServiceName(): string {
        return BusinessCalculator.serviceName
    }

    addBusiness(sn:string) {
        this._save.business.push({
            floatingStock: 1000,
            stockPriceHistory: [],
            name: "Test Comp",
            shortName: sn,
            totalStock: 10000
        })
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
        let buyPrice = Math.round(Math.random()*10)-4;
        cB.stockPriceHistory.push({buyPrice:buyPrice,date:GameServices.getService<TimeService>(TimeService.serviceName).getTicks(), keyPoint:StockPriceKeyPoint.Day,sellPrice:buyPrice})
        this.cleanBusinessHistory(cB);
    }
}