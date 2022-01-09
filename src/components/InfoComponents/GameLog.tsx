import React from "react";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { GlobalEvents, GameServices } from "../../logic/services";
import { EventNames, GameConfig, GameFlags } from "../../logic/services/Config";
import { GS } from "../../logic/services/GS";
import { TimeService } from "../../logic/services/timeService/TimeService";
import './GameLog.css'

type GameLogState = {
    messages: GameLogMessage[]
}

export class GameLog extends React.Component<{}, GameLogState> {

    private _timeService: TimeService
    private _eventService: GlobalEvents

    constructor(prop: string) {
        super(prop);
        this._timeService = GameServices.getService<TimeService>(TimeService.serviceName)
        this._eventService = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        this.state = {
            messages: []
        }
    }

    componentDidMount() {
        this._eventService.subscribe(EventNames.AddLogMessage, (caller, message) => {
            let messages = this.state.messages
            if (messages.length > GameConfig.maxLogMessages) {
                messages.pop()
            }
            if (typeof message == 'string') {
                messages.unshift({ msg: message, ticks: this._timeService.getTicks(), key: 'msg', cat:'general' } as GameLogMessage)
            } else {
                let m = message as GameLogMessage
                m.ticks = m.ticks !== undefined ? m.ticks : this._timeService.getTicks()
                messages.unshift(m)
            }
            this.setState({ messages: messages })
        })
    }

    render(): React.ReactNode {
        let hide = GS.getFlagService().getFlagString(GameFlags.l_s_hide).split('|')
        if(!UIHelper.hasTutorialCheck(5)) return ''
        return (
            <div id="reactLog">
                <h2>Logs</h2>
                <div style={{display:'none'}}>
                    <span className="checkboxLabel">General</span><input type={'checkbox'} checked={hide.indexOf(GameLogCategories.General)==-1} onChange={(e)=>{
                        if(hide.indexOf(GameLogCategories.General) > -1){
                            hide.splice(hide.indexOf(GameLogCategories.General),1)
                        }

                        if(!e.target.checked){
                            hide.push(GameLogCategories.General)
                        }
                        console.log(['möp',e.target.checked, GS.getSaveDataService().getGameSave()])

                        GS.getFlagService().setFlag(GameFlags.l_s_hide,hide.join('|'))
                        this.setState({messages: this.state.messages})
                    }} />
                    <span className="checkboxLabel">Game</span> <input type={'checkbox'} checked={hide.indexOf(GameLogCategories.Game)==-1} onChange={(e)=>{
                        if(hide.indexOf(GameLogCategories.Game) > -1){
                            hide.splice(hide.indexOf(GameLogCategories.Game),1)
                        }

                        if(!e.target.checked){
                            hide.push(GameLogCategories.Game)
                        }
                        console.log(['möp',e.target.checked, GS.getSaveDataService().getGameSave()])

                        GS.getFlagService().setFlag(GameFlags.l_s_hide,hide.join('|'))
                        this.setState({messages: this.state.messages})
                    }} />
                    <span className="checkboxLabel">Account</span> <input type={'checkbox'} checked={hide.indexOf(GameLogCategories.Account)==-1} onChange={(e)=>{
                        if(hide.indexOf(GameLogCategories.Account) > -1){
                            hide.splice(hide.indexOf(GameLogCategories.Account),1)
                        }

                        if(!e.target.checked){
                            hide.push(GameLogCategories.Account)
                        }
                        console.log(['möp',e.target.checked, GS.getSaveDataService().getGameSave()])

                        GS.getFlagService().setFlag(GameFlags.l_s_hide,hide.join('|'))
                        this.setState({messages: this.state.messages})
                    }} />
                </div>
                <div className="reactLog">
                    {this.state.messages.filter(m=>{ 
                        return hide.indexOf(m.cat) == -1
                    }).map((d, idx) => {
                        return (
                            <div className={"logmessage"} key={idx}>
                                <span className="logTimeStamp">[{this._timeService.getFormated('A/C/P', d.ticks)}]</span>
                                &nbsp;<span className={d.key+' logMsg'}>{d.msg}</span>
                            </div>)
                    })}
                </div>
            </div>)
    }
}

export interface GameLogMessage {
    cat: string;
    msg: string
    ticks: number
    key: string
}

export class GameLogCategories {
    static Account: string = 'account'
    static General: string = 'general'
    static Shop: string = 'shop'
    static Game: string = 'cicle'
    static Depot: string = 'depot';
}