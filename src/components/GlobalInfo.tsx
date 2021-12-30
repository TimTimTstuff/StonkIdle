import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { GameServices, GlobalEvents } from "../logic/services";
import { BusinessCalculator } from "../logic/services/businessCalculator/BusinessCalculator";
import { EventNames } from "../logic/services/Config";
import { Potential } from "../model/Business";
import { faAngleUp, faAngleDown, faAngleDoubleUp, faAngleDoubleDown, faEquals, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { TimeService } from "../logic/services/timeService/TimeService";
import './GlobalInfo.css'
import { GameCalculator } from "../logic/module/calculator/GameCalculator";

type GlobalInfoState = {
    marketPotential: Potential
}

export class GlobalInfo extends React.Component<{}, GlobalInfoState> {

    private _businessService: BusinessCalculator
    private _timeService: TimeService
    private _preMarket: Potential
    private _tickChange: number

    constructor(arg: {}) {
        super(arg);
        this._businessService = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName)
        this._timeService = GameServices.getService<TimeService>(TimeService.serviceName)
        this.state = {
            marketPotential: this._businessService.getMarketPerformance()
        }

        this._preMarket = this.state.marketPotential
        this._tickChange = this._timeService.getTicks()

        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.periodChange, (caller, args) => {
            let newMarket = this._businessService.getMarketPerformance()
            if(newMarket != this._preMarket){
                this._tickChange = this._timeService.getTicks()
                this._preMarket = newMarket
            }
            this.setState({
                marketPotential: newMarket
            })
        })
    }

    render(): React.ReactNode {
        let iconClass = GameCalculator.getPotentialClassIcon(this._businessService.getMarketPerformance())
        return (
            <div>
            <div className="marketSituation">
            <span className="sincePotientialTop">Market Potential</span><br/>
            <span className={iconClass.c}>
                <FontAwesomeIcon className={iconClass.c + ' marketIcon'} icon={iconClass.i} /><br/>
                </span>
                <span className="sincePotiential">Since: {this._timeService.getFormated('A/C/P',this._tickChange)}</span>
                
            </div>
            
        </div>)
    }
}