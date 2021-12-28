import { Business } from "../model/Business";
import { ConsoleLogger, LogLevel } from "./module/logger/Logger";
import { GameServices, GlobalEvents, LogService } from "./services";
import { BusinessCalculator } from "./services/businessCalculator/BusinessCalculator";
import { GameConfig } from "./services/Config";
import { SaveDataService } from "./services/saveData/SaveDataService";
import { TimeBox, TimeService } from "./services/timeService/TimeService";

export class Game {

    public static testBusiness: Business;
    public static loopId:number;

    private _gameEvent:GlobalEvents | undefined;
    private _timeService:TimeService | undefined;
    private _currentPeriod:TimeBox | undefined;
    private _log: LogService | undefined;

    constructor() {
        this.registgerGameEvents();
        this.registerServices();
        this._currentPeriod = this._timeService?.getCurrentTimeBox()
        clearInterval(Game.loopId)
        Game.loopId = setInterval(() => {
            if(this._timeService == undefined){
                this._log?.error('Game',`No TimeService?`)
            }
            this._timeService?.addTimeTick();
            if (this._currentPeriod?.period !== this._timeService?.getCurrentTimeBox().period) {
                this._gameEvent?.callEvent('changePeriod', this, { prePeriod: this._currentPeriod?.period, newPeriod: this._timeService?.getCurrentTimeBox().period });
                this._currentPeriod = this._timeService?.getCurrentTimeBox();
            }
        }, GameConfig.gameTickSpeedInMS) as unknown as number
    }

    registgerGameEvents() {
       
    }

    registerServices(){
        Game.testBusiness = {shortName: 'AAA', floatingStock: 1000, totalStock:2000, stockPriceHistory:[], name: 'Test Company'};
        this._log = new LogService(new ConsoleLogger(LogLevel.Debug, true, true))
        GameServices.registerService(this._log)
        GameServices.registerService(new SaveDataService(20))
        this._gameEvent = new GlobalEvents()
        this._timeService = TimeService.getInstance()
        GameServices.registerService(this._gameEvent)
        GameServices.registerService(this._timeService)
        GameServices.registerService(new BusinessCalculator())
    }

}