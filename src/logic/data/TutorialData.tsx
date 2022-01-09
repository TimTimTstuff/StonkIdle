import { PopupState } from "../../components/GenericComponents/Popup"
import { GameServices, GlobalEvents, LogService } from "../services"
import { BusinessCalculator } from "../services/businessCalculator/BusinessCalculator"
import { EventNames, GameFlags } from "../services/Config"
import { FlagService } from "../services/saveData/FlagService"
import { TimeService } from "../services/timeService/TimeService"

export class TutorialModul {

   
    private static instance:TutorialModul
    private _flagService: FlagService
    private _event: GlobalEvents
    private _log: LogService
    private _time: TimeService
    private _business: BusinessCalculator
    private _lastPerio: number
    private constructor() {
        // eslint-disable-next-line eqeqeq
        if(TutorialModul.instance != undefined) throw new Error('no two allowed')
        this._event = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        this._flagService = GameServices.getService<FlagService>(FlagService.serviceName)
        this._log = GameServices.getService<LogService>(LogService.serviceName)
        this._log.debug('TutorialData',`Created`)
        this._time = GameServices.getService<TimeService>(TimeService.serviceName)
        this._business = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName)
        this._lastPerio = this._time.getCurrentTimeBox().period
    }

    private run() {
        let tBox = this._time.getCurrentTimeBox()
        switch(this.getCurrentStage()){
            case 0:
                this._event.callEvent(EventNames.showPopup,this,this.getStage1Content())
                this._lastPerio = tBox.period
                break;
            case 2:
                if(tBox.period > this._lastPerio) {
                    this._event.callEvent(EventNames.showPopup, this, this.getStage2Content())
                    this._lastPerio = tBox.period
                }
                break;
            case 3:
                if(tBox.period > this._lastPerio){
                    this._event.callEvent(EventNames.showPopup, this, this.getStage3Content())
                    this._lastPerio = tBox.period
                }
                break;
            case 4:
                if(tBox.period > this._lastPerio){
                    this._event.callEvent(EventNames.showPopup,this,this.getStage4Content())
                    this._lastPerio = tBox.period
                }
                break;
            case 5:
                if(tBox.period > this._lastPerio){
                    this._event.callEvent(EventNames.showPopup,this,this.getStage5Content())
                    this._lastPerio = tBox.period
                }
                break;
            case 6:
                if(tBox.period > this._lastPerio){
                    this._event.callEvent(EventNames.showPopup,this,this.getStage6Content())
                    this._lastPerio = tBox.period
                }
                break;
            case 7:
                if(tBox.period > this._lastPerio){
                    this._event.callEvent(EventNames.showPopup,this,this.getStage7Content())
                    this._lastPerio = tBox.period
                }
                break;
            case 8:
                if(tBox.period > this._lastPerio){
                    this._event.callEvent(EventNames.showPopup,this,this.getStage8Content())
                    this._lastPerio = tBox.period
                }
                break;
            case 99:
                if(tBox.period > this._lastPerio){
                    this._event.callEvent(EventNames.showPopup,this,this.getStageFinalContent())
                    this._lastPerio = tBox.period
                }
                break;
        }
        

        
    }
    getStageFinalContent(): unknown {
        return {
            title:'More detail',
            display:true,
            okButtonCallback:()=>{this.setTutorialStage(9); this._flagService.setFlag(GameFlags.g_i_ticksPerLoop,1)},
            content:(<span>So far this is the end of the Tutorial. Have fun!</span>)
        }
    }
    getStage8Content(): unknown {
        return {
            title:'Shopping and more Information',
            display:true,
            okButtonCallback:()=>{this.setTutorialStage(99)},
            content:(<span>In the left bottom window, you will find more information and shops and other content of the Game. 
                <br/>
            </span>)
        }
    }
    getStage7Content(): unknown {
        return {
            title:'More detail',
            display:true,
            okButtonCallback:()=>{this.setTutorialStage(8)},
            content:(<span>Also we have more specific information about the Business. 
                <br/>You can see the Stocks you own. How the Performance of the Business is. 
                <br/>You can also see the Buy/Sell prices and the History information about the current Cicle and Age.
            </span>)
        }
    }
    getStage6Content(): unknown {
        return {
            title:'All the Business',
            display:true,
            okButtonCallback:()=>{this.setTutorialStage(7)},
            content:(<span>Next to the chart, we have the list of Business. This list shows all Business you can currently buy shares form. 
                <br/>
                <br/> 
            </span>)
        }
    }
    getStage5Content(): unknown {
        return {
            title:'The Business to buy!',
            display:true,
            okButtonCallback:()=>{this.setTutorialStage(6)},
            content:(<span>The chart shows you the "SellPrice" of the last 50 episods. The current prices will be shown in the table. 
                <br/>
                <br/> 
            </span>)
        }
    }
    getStage4Content(): unknown {
        return {
            title:'Charting',
            display:true,
            okButtonCallback:()=>{this.setTutorialStage(5); this._event.callEvent(EventNames.selectedBusiness,this,this._business.getAllBusiness()[0].shortName)},
            content:(<span>As said, in this games you mainly buy and sell stocks. Let us have a look at the Chart! 
            </span>)
        }
    }
    getStage3Content(): unknown {
        return {
            title:'Features? We want Features!',
            display:true,
            okButtonCallback:()=>{this.setTutorialStage(4)},
            content:(<span>You will not start with all features unlocked. Play for a while, to find all unlockables! 
            </span>)
        }
    }
    private getStage2Content(): PopupState {
       return {
           title:'Where the money goes',
           display:true,
           okButtonCallback:()=>{this.setTutorialStage(3)},
           content:(<span>Next to the Time you can see you Main and Saving Account. 
               <br/>The <b>Main Account</b> is used to buy Stocks / Tools or pay Taxes. 
               <br/>
               <br/>The <b>Saving Account</b> holds all your live-savings. You can't witdraw from it but Store Money there.
               <br/>The <b>Saving Account</b> is your Game-Score. Also you get Interest on the amount on it. 
               <br/>
               <br/><i><small>The Savings Account has a interest rate per Cicle. Every Period you get payed based on this. The Periods below the Interest shows for how many more Periods you will get interest.</small></i>
           </span>)
       }
    }

    private getCurrentStage() {
       return this._flagService.getFlagInt(GameFlags.t_i_level)
    }

    private getStage1Content(): PopupState {
        return {
            content: (<span>Welcome to the Game!
                <br /> This is a Stock-Market idle Simulator!
                <br /> In the left top corner you can see the time ticking!
                <br /> 
                <br /> To go to the next step, click 'OK'. Or Skip the Tutorial!
                <br />
                <i>This game has its one time calculation.
                    <ul>
                        <li>The green bar shows how many Ticks in this Period are gone.</li>
                        <li>Most events happen on a Period change.</li>
                        <li>The factor is allways 100. (<small>100 ticks = 1 Period, 100 periods = 1 Cicle</small>)</li>
                    </ul>
                </i>
                <button onClick={(e) => {
                    this.setTutorialStage(99)
                    this._flagService.setFlag(GameFlags.t_b_active, false)
                    this._event.callEvent(EventNames.showPopup,this,{display:false})
                } }>Skip Tutorial?</button>
            </span>),
            display: true,
            title: "Let's start with Stonk Idle",
            okButtonCallback: () => { this.setTutorialStage(2)}
        }
    }

    private setTutorialStage(stage:number){
        this._log.debug('TutorialData',`Set tutorial Stage: ${stage}`)
        this._flagService.setFlag(GameFlags.t_i_level,stage)
        this._event.callEvent(EventNames.periodChange,this,null) 
    }
    
    public static RunTutorial(){
        // eslint-disable-next-line eqeqeq
        if(TutorialModul.instance == undefined){
            TutorialModul.instance = new TutorialModul()
        }

        TutorialModul.instance.run()

    }

}