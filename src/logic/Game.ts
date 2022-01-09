import { AccountService } from './services/accounts/AccountService'
import { ConsoleLogger, LogLevel } from './module/logger/Logger'
import { GameServices, GlobalEvents, LogService } from './services'
import { BusinessCalculator } from './services/businessCalculator/BusinessCalculator'
import { EventNames, GameFlags } from './services/Config'
import { SaveDataService } from './services/saveData/SaveDataService'
import { TimeService } from './services/timeService/TimeService'
import { DepotService } from './services/accounts/DepotService'
import { FlagService } from './services/saveData/FlagService'
import { StatsService } from './services/accounts/StatsService'
import { TutorialModul } from './data/TutorialData'
import { StoreManager } from './services/businessCalculator/StoreManager'
import { GoalsData } from './data/GoalsData'
import { InfoData } from './services/dataServices/InfoData'
import { GameLogCategories } from '../components/InfoComponents/GameLog'
import { NewsService } from './services/dataServices/NewsService'
import { SchoolService } from './services/dataServices/SchoolService'
import { GS } from './services/GS'
import { OfflineEarningsService } from './services/timeService/OfflineEarningsService'
import { GameFormating } from './module/calculator/GameFormating'

export class Game {

    private static instance: Game;
    public static loopId: number;
    public static lastLoop:number;
    //Services
    private _gameEvent: GlobalEvents | undefined
    private _timeService: TimeService | undefined
    private _log: LogService | undefined
    private _businessCalculator: BusinessCalculator | undefined
    private _accountService: AccountService | undefined
    private _saveManager: SaveDataService | undefined
    private _depotService: DepotService | undefined
    private _flagService: FlagService | undefined
    private _statService: StatsService | undefined
    private _store: StoreManager | undefined
    private _goal: GoalsData | undefined
    private _info: InfoData | undefined
    private _news: NewsService | undefined
    private _school: SchoolService | undefined
    private _offline: OfflineEarningsService | undefined

    constructor() {
        if (Game.instance !== undefined) throw new Error('Dublicate Game')
        this.registerServices()
        this.registgerGameEvents()
        this.setupGameLoop()
        Game.lastLoop = new Date().getTime()
        if (this._flagService?.getFlagBool(GameFlags.t_b_active)) {
            TutorialModul.RunTutorial()
        }
        setTimeout(() => {
            this._gameEvent?.callEvent(EventNames.selectedBusiness, this, this._businessCalculator?.getAllBusiness()[0].shortName)
            TutorialModul.RunTutorial()
        }, 300)
    }

    public static getInstance() {
        if (Game.instance === undefined) {
            Game.instance = new Game()
        }

        return Game.instance
    }

    private setupGameLoop() {
        clearInterval(Game.loopId)
        Game.loopId = setInterval(() => {
            let xLoop = this._flagService?.getFlagInt(GameFlags.g_i_gameLoopTickSpeed)??200
            if (this._timeService === undefined) {
                this._log?.error('Game', `No TimeService?`)
            }
            let delta = new Date().getTime() - Game.lastLoop
            let ticks = GameFormating.round(delta/xLoop)
            Game.lastLoop = new Date().getTime()
            //calculate ticks in game speed
            this._timeService?.addTimeTick(ticks)

        }, this._flagService?.getFlagInt(GameFlags.g_i_gameLoopTickSpeed)) as unknown as number
    }

    registgerGameEvents() {
        this._gameEvent?.subscribe(EventNames.periodChange, (caller, args) => {
            if (this._flagService?.getFlagBool(GameFlags.t_b_active)) {
                TutorialModul.RunTutorial()
            }
            this._businessCalculator?.onPeriodChange()
            this._accountService?.onPeriodUpdate()
            this._offline?.processOfflineTime()
            this._saveManager?.save()
        })

        this._gameEvent?.subscribe(EventNames.circleChange, (caller, args) => {
            this._gameEvent?.callEvent(EventNames.AddLogMessage, this, { msg: `Change of Cicle`, key: 'info', cat:GameLogCategories.Game })
            this._accountService?.onCicleUpdate()
            this._businessCalculator?.onCicleChange()
        })
    }

    registerServices() {
        this._log = new LogService(new ConsoleLogger(LogLevel.Debug, true, true))
        GameServices.registerService(this._log)
        this.disableLoggerChannel()

        this._saveManager = SaveDataService.getInstance(0)
        GameServices.registerService(this._saveManager)
        this._log.debug('GAME', 'Save Loaded', this._saveManager.getGameSave())
        this._gameEvent = new GlobalEvents()
        GameServices.registerService(this._gameEvent)

        this._flagService = new FlagService(this._saveManager)
        GameServices.registerService(this._flagService)

        this._timeService = TimeService.getInstance(this._flagService, this._saveManager)
        GameServices.registerService(this._timeService)

        this._statService = new StatsService(this._timeService, this._saveManager, this._log)
        GameServices.registerService(this._statService)

        this._businessCalculator = new BusinessCalculator(this._timeService, this._flagService)
        GameServices.registerService(this._businessCalculator)

        this._accountService = new AccountService(this._saveManager, this._gameEvent, this._timeService, this._flagService, this._statService)
        GameServices.registerService(this._accountService)

        this._depotService = new DepotService(this._saveManager, this._businessCalculator, this._accountService, this._gameEvent, this._statService)
        GameServices.registerService(this._depotService)

        this._store = new StoreManager(this._log, this._accountService, this._flagService, this._statService, this._saveManager, this._gameEvent)
        GameServices.registerService(this._store)

        this._goal = new GoalsData(this._saveManager, this._statService, this._flagService, this._gameEvent, this._log)
        GameServices.registerService(this._goal)

        this._info = new InfoData()
        GameServices.registerService(this._info)

        this._news = new NewsService(this._saveManager, this._gameEvent, this._flagService)
        GameServices.registerService(this._news)

        this._school = new SchoolService(this._saveManager, this._gameEvent)
        GameServices.registerService(this._school)

        this._offline = new OfflineEarningsService(this._gameEvent, this._flagService, this._saveManager)
        GameServices.registerService(this._offline)


    }
    disableLoggerChannel() {
        let log = (<ConsoleLogger>this._log?.getLogger())
        log.setChannelActive('BusinessCalculator', false)
        log.setChannelActive('StoreItemGenerator', false) 
        log.setChannelActive('TutorialData', false) 
        log.setChannelActive('GAME', false)
        log.setChannelActive('TimeBox', false)
    }

}