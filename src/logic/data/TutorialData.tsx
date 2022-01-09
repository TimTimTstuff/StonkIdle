import { PopupState } from "../../components/GenericComponents/Popup"
import { GameServices, GlobalEvents, LogService } from "../services"
import { BusinessCalculator } from "../services/businessCalculator/BusinessCalculator"
import { EventNames, GameFlags } from "../services/Config"
import { FlagService } from "../services/saveData/FlagService"
import { TimeService } from "../services/timeService/TimeService"

export class TutorialModul {


    private static instance: TutorialModul
    private _flagService: FlagService
    private _event: GlobalEvents
    private _log: LogService
    private _time: TimeService
    private _business: BusinessCalculator
    private _lastPerio: number
    private constructor() {
        // eslint-disable-next-line eqeqeq
        if (TutorialModul.instance != undefined) throw new Error('no two allowed')
        this._event = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        this._flagService = GameServices.getService<FlagService>(FlagService.serviceName)
        this._log = GameServices.getService<LogService>(LogService.serviceName)
        this._log.debug('TutorialData', `Created`)
        this._time = GameServices.getService<TimeService>(TimeService.serviceName)
        this._business = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName)
        this._lastPerio = this._time.getCurrentTimeBox().period
    }

    private run() {
        let tBox = this._time.getCurrentTimeBox()
        switch (this.getCurrentStage()) {
            case 0:
                this._event.callEvent(EventNames.showPopup, this, this.getStage1Content())
                this._lastPerio = tBox.period
                break;
            case 1:
                    this._event.callEvent(EventNames.showPopup, this, this.getStage2Content())
                    this._lastPerio = tBox.period
                break;
            case 2:
                    this._event.callEvent(EventNames.showPopup, this, this.getStage3Content())
                    this._lastPerio = tBox.period
                break;
            case 3:
                    this._event.callEvent(EventNames.showPopup, this, this.getStage4Content())
                    this._lastPerio = tBox.period
                break;
            case 4:
                    this._event.callEvent(EventNames.showPopup, this, this.getStage5Content())
                    this._lastPerio = tBox.period
                break;
                case 5:
                    this._event.callEvent(EventNames.showPopup, this, this.getStage6Content())
                    this._lastPerio = tBox.period
                break;
            case 99:
                    this._event.callEvent(EventNames.showPopup, this, this.getStageFinalContent())
                    this._lastPerio = tBox.period
                break;
        }



    }
    getStageFinalContent(): unknown {
        return {
            title: 'More detail',
            display: true,
            okButtonCallback: () => { this.setTutorialStage(6); this._flagService.setFlag(GameFlags.g_i_ticksPerLoop, 1) },
            content: (<span>So far this is the end of the Tutorial. Have fun!</span>)
        }
    }

    getStage6Content(): unknown {
        return {
            title: 'News and Logs',
            display: true,
            okButtonCallback: () => { this.setTutorialStage(99) },
            content: (<div>In the last section you can find News and Logs
                <ul>
                    <li><b>News</b> you can buy a News-Subsciption in the Store. They show you relevant Market-Information</li>
                    <li><b>Logs</b> they show you what's happening in the Game. Goals Reached, Interest, Tax, etc...</li>
                </ul>
            </div>)
        }
    }

    getStage5Content(): unknown {
        return {
            title: 'All the other Features',
            display: true,
            okButtonCallback: () => { this.setTutorialStage(5) },
            content: (<div>In this bottom section you can find all the other Features, some of them have to be unlocked!
                <ul>
                    <li><b>Goals</b> this are your goals for the game. Every time you achive a goal, you get a small bonus!</li>
                    <li><b>School</b> here you can unlock more features and information. Each Class needs a specific time (Periods) and cost per Period</li>
                    <li><b>Settings</b> here you can Reset your Save or restart the Tutorial. There are also a Discord link, in case you want to get in contact with the developer!</li>
                </ul>
            </div>)
        }
    }
    getStage4Content(): unknown {
        return {
            title: 'Your Depot',
            display: true,
            okButtonCallback: () => { this.setTutorialStage(4); this._event.callEvent(EventNames.selectedBusiness, this, this._business.getAllBusiness()[0].shortName) },
            content: (<div>
                Here you can see all avaliable Business you can buy Stocks from. You start with 3 Business but there will be more later!
                <ul>
                    <li><b>Left</b> List of all Business
                    <ul>
                        <li><b>Top</b> Name of the Business</li>    
                        <li><b>Bottom</b> Owned Stocks, Increase of your Depot</li>    
                        <li><b>Right</b> Value of your Stocks</li>    
                    </ul> 
                    </li>
                    <li><b>Right</b> Information about the Business / Shares. You start with minimal information but can get more later!
                        <ul>
                            <li><b>Prices</b>Here you find more information about the Prices of the Shares</li>
                            <li><b>Buy / Sell</b> Here you can Buy and Sell shares</li>
                            <li><b>More Information</b> There can be a lot more information be unlocked</li>
                        </ul>
                    </li>

                </ul>
            </div>)
        }
    }
    getStage3Content(): unknown {
        return {
            title: 'Where are the Stonks!',
            display: true,
            okButtonCallback: () => { this.setTutorialStage(3) },
            content: (<div>
                Here you will find the Chart for the Stonk and current information.
                <ul>
                    <li><b>Top of the Chart</b> here you find the current prices and the change since the last period, also the Name of the selected stock</li>
                    <li><b>The Chart</b> this showes you the development of the Stock over the last 50 periods</li>
                </ul>
            </div>)
        }
    }
    private getStage2Content(): PopupState {
        return {
            title: 'Meta - Information',
            display: true,
            okButtonCallback: () => { this.setTutorialStage(2) },
            content: (<ul>
                <li><b>Top</b> here you find Information about the Market and your Accounts!</li>
                <li>
                    <b>Time</b> I have added a own Time-System for easier calculation and modification. Every 100 Ticks a new Period starts! Most updates happen after one Period
                </li>
                <li>
                    <b>Accounts</b> Next to the Time we have your Accounts:
                    <ul>
                        <li>
                            <b>Main Account</b> with this you buy your Stocks and Items in the Store
                        </li>
                        <li>
                            <b>Savings Account</b> here you store your Money for your retirement. This is your Game-Score and also you can get interest from it! You can store money there but not withdraw!
                        </li>
                        <li>
                            <b>Credit Account</b> here you can lend money!
                        </li>
                    </ul>
                </li>
                <li><b>Pay/Sell/Store</b> you use the buttons next to the Accounts to transfere money to or from!</li>
            </ul>)
        }
    }

    private getCurrentStage() {
        return this._flagService.getFlagInt(GameFlags.t_i_level)
    }

    private getStage1Content(): PopupState {
        return {
            content: (<span>Welcome to the Game!
                <br /> This is a Stock-Market idle Simulator!
                <br /> This is a little side project i started in my vacation. I like this type of idle games and developed it in the beginning just for me.
                <br />
                <br /> I thought maybe others will enjoy this too, so i decided to push it to the world.
                <br />
                <br /> This tutorial will help you to understand the UI and the basic game mechanics!
                <br />
                <br/> Or you can: 
                <button onClick={(e) => {
                    this.setTutorialStage(99)
                    this._flagService.setFlag(GameFlags.t_b_active, false)
                    this._event.callEvent(EventNames.showPopup, this, { display: false })
                }}>Skip Tutorial?</button>
            </span>),
            display: true,
            title: "Let's start with Stonk Idle",
            okButtonCallback: () => { this.setTutorialStage(1) }
        }
    }

    private setTutorialStage(stage: number) {
        this._log.debug('TutorialData', `Set tutorial Stage: ${stage}`)
        this._flagService.setFlag(GameFlags.t_i_level, stage)
        this._event.callEvent(EventNames.periodChange, this, null)
    }

    public static RunTutorial() {
        // eslint-disable-next-line eqeqeq
        if (TutorialModul.instance == undefined) {
            TutorialModul.instance = new TutorialModul()
        }

        TutorialModul.instance.run()

    }

}