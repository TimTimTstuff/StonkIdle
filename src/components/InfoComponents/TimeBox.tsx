import React from "react";
import { GameFormating } from "../../logic/module/calculator/GameFormating";
import { LogService, GameServices } from "../../logic/services";
import { GameConfig, GameFlags } from "../../logic/services/Config";
import { GS } from "../../logic/services/GS";
import { TimeService } from "../../logic/services/timeService/TimeService";
import { InfoBubble } from "../GenericComponents/InfoBubble";
import './TimeBox.css'

type TimeData = {
    ticks: number,
    useGameTime: boolean
}

export class TimeBox extends React.Component<TimeData, TimeData>{
    private _timeService: TimeService;
    private _log: LogService;
    private static intervalId: number;

    constructor(data: TimeData) {
        super(data);
        this._log = GameServices.getService<LogService>(LogService.serviceName)
        this._timeService = GameServices.getService<TimeService>(TimeService.serviceName)
        this.state = {
            ticks: data.ticks,
            useGameTime: data.useGameTime
        }
        this._log.debug('TimeBox', `Start with GameTime: ${this.state.useGameTime}`)
        if (this.state.useGameTime) {
            clearInterval(TimeBox.intervalId)
            this._log.log('TimeBox', `Start Interval`)
            TimeBox.intervalId = setInterval(() => {
                this.setState({ ticks: this._timeService.getTicks(), useGameTime: true })
            }, GameConfig.gameTickSpeedInMS * 2) as unknown as number
        }
    }

    render(): React.ReactNode {
        let currTicks = this._timeService.getCurrentTimeBox().ticks;
        let timeBox = this._timeService.getTimeBox(this.state.ticks)

        return (<div className="timeBoxContainer">
            <div className='timebox'>
                <table>
                    <thead>
                        <tr>
                            <th>Age</th>
                            <th>Cicle</th>
                            <th>Period</th>
                            <th>Ticks</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{timeBox.age}</td>
                            <td>{timeBox.circle}</td>
                            <td>{timeBox.period}</td>
                            <td>{GameFormating.formatToRound(timeBox.ticks,0)}</td>
                           </tr>
                    </tbody>
                </table>
                
                <br/>
            </div>
            <div className="timeload"><div className="timeloadinner" style={{ width: currTicks + '%' }}></div></div>
        </div>)
    }



    
}