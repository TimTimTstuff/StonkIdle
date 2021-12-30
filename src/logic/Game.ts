import { AccountService } from './services/accounts/AccountService'
import { ConsoleLogger, LogLevel } from './module/logger/Logger'
import { GameServices, GlobalEvents, LogService } from './services'
import { BusinessCalculator } from './services/businessCalculator/BusinessCalculator'
import { EventNames, GameConfig } from './services/Config'
import { SaveDataService } from './services/saveData/SaveDataService'
import { TimeService } from './services/timeService/TimeService'
import { DepotService } from './services/accounts/DepotService'

export class Game {

    private static instance: Game;
    public static loopId:number
    //Services
    private _gameEvent:GlobalEvents | undefined
    private _timeService:TimeService | undefined
    private _log: LogService | undefined
    private _businessCalculator: BusinessCalculator | undefined
    private _accountService: AccountService | undefined
    private _saveManager: SaveDataService | undefined
    private _depotService: DepotService | undefined

    constructor() {
        if(Game.instance !== undefined) throw new Error('Dublicate Game')
        this.registerServices()
        this.registgerGameEvents()
        this.setupGameLoop()
    }

    public static getInstance() {
        if(Game.instance === undefined)
        {
            Game.instance = new Game()
        }

        return Game.instance
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
           this._accountService?.onPeriodUpdate()
           this._gameEvent?.callEvent(EventNames.AddLogMessage,this,{msg:`Period Changed! - Game Saved!`, key:'info', ticks: this._timeService?.getTicks()})
           this._saveManager?.save()
        })
    }

    registerServices(){
        this._log = new LogService(new ConsoleLogger(LogLevel.Debug, true, true))
        GameServices.registerService(this._log)

        this._saveManager = SaveDataService.getInstance(0)
        GameServices.registerService(this._saveManager)

        this._gameEvent = new GlobalEvents()
        GameServices.registerService(this._gameEvent)

        this._timeService = TimeService.getInstance()
        GameServices.registerService(this._timeService)

        this._businessCalculator = new BusinessCalculator(this._timeService)
        GameServices.registerService(this._businessCalculator)

        this._accountService = new AccountService(this._saveManager, this._gameEvent)
        GameServices.registerService(this._accountService)

        this._depotService = new DepotService(this._saveManager, this._businessCalculator,this._accountService, this._gameEvent)
        GameServices.registerService(this._depotService)
    }

}