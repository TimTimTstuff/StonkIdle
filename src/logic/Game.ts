import { Business } from '../model/Business'
import { ConsoleLogger, LogLevel } from './module/logger/Logger'
import { GameServices, GlobalEvents, LogService } from './services'
import { BusinessCalculator } from './services/businessCalculator/BusinessCalculator'
import { EventNames, GameConfig } from './services/Config'
import { SaveDataService } from './services/saveData/SaveDataService'
import { TimeService } from './services/timeService/TimeService'

export class Game {

    public static testBusiness: Business
    public static loopId:number
    private _gameEvent:GlobalEvents | undefined
    private _timeService:TimeService | undefined
    private _log: LogService | undefined
    private _businessCalculator: BusinessCalculator | undefined

    constructor() {
        this.registerServices()
        this.registgerGameEvents()
        this.setupGameLoop()
    }

    private setupGameLoop() {
        clearInterval(Game.loopId)
        Game.loopId = setInterval(() => {

            if (this._timeService === undefined) {
                this._log?.error('Game', `No TimeService?`)
            }
            //calculate ticks in game speed
            this._timeService?.addTimeTick()

        }, GameConfig.gameTickSpeedInMS) as unknown as number
    }

    registgerGameEvents() {
       this._gameEvent?.subscribe(EventNames.periodChange, (caller, args) => {
           this._businessCalculator?.onPeriodChange()
        })
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
        this._businessCalculator = new BusinessCalculator();
        GameServices.registerService(this._businessCalculator)
    }

}