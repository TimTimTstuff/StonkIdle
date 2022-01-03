import React from "react";
import { GlobalEvents, GameServices } from "../../logic/services";
import { EventNames, GameConfig } from "../../logic/services/Config";
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
                messages.unshift({ msg: message, ticks: this._timeService.getTicks(), key: 'msg' } as GameLogMessage)
            } else {
                let m = message as GameLogMessage
                m.ticks = m.ticks !== undefined ? m.ticks : this._timeService.getTicks()
                messages.unshift(m)
            }
            this.setState({ messages: messages })
        })
    }

    render(): React.ReactNode {
        return (
            <div id="reactLog">
                <h2>Logs</h2>
                <div className="reactLog">
                    {this.state.messages.map((d, idx) => {
                        return (
                            <div className={"logmessage"} key={idx}>
                                <span className="logTimeStamp">[{this._timeService.getFormated('A/C/P', d.ticks)}]</span>
                                &nbsp;<span className={d.key}>{d.msg}</span>
                            </div>)
                    })}
                </div>
            </div>)
    }
}

export interface GameLogMessage {
    msg: string
    ticks: number
    key: string
}