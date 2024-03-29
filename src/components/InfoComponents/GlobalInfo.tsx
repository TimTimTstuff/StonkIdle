import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { GameCalculator } from "../../logic/module/calculator/GameCalculator";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { GameServices, GlobalEvents } from "../../logic/services";
import { BusinessCalculator } from "../../logic/services/businessCalculator/BusinessCalculator";
import { EventNames, GameFlags } from "../../logic/services/Config";
import { SchoolClassList } from "../../logic/services/dataServices/SchoolService";
import { GS } from "../../logic/services/GS";
import { FlagService } from "../../logic/services/saveData/FlagService";
import { TimeService } from "../../logic/services/timeService/TimeService";
import { Potential, MarketVolatility } from "../../model/Business";
import './GlobalInfo.css'

type GlobalInfoState = {
    marketPotential: Potential,
    marketVolatility: MarketVolatility
}

export class GlobalInfo extends React.Component<{}, GlobalInfoState> {

    private _businessService: BusinessCalculator
    private _timeService: TimeService
    private _preMarket: Potential
    private _tickChange: number
    private _volChanged: number
    private _preVol: MarketVolatility

    constructor(arg: {}) {
        super(arg);
        this._businessService = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName)
        this._timeService = GameServices.getService<TimeService>(TimeService.serviceName)
        this.state = {
            marketPotential: this._businessService.getMarketPerformance(),
            marketVolatility: this._businessService.getMarketVolatility()
        }
        this._volChanged = this._timeService.getTicks()
        this._preVol = this.state.marketVolatility
        this._preMarket = this.state.marketPotential
        this._tickChange = this._timeService.getTicks()
    }

    componentDidMount() {
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.periodChange, (caller, args) => {
            let newMarket = this._businessService.getMarketPerformance()
            let newVol = this._businessService.getMarketVolatility()

            if (newMarket !== this._preMarket) {
                this._tickChange = this._timeService.getTicks()
                this._preMarket = newMarket
            }

            if (newVol !== this._preVol) {
                this._volChanged = this._timeService.getTicks()
                this._preVol = newVol
            }

            this.setState({
                marketPotential: newMarket,
                marketVolatility: newVol
            })
        })
    }

    render(): React.ReactNode {
        if(!UIHelper.hasTutorialCheck(1)) return ''
        return (
            <div className="globalInfo">
                <div>
                    {this.getMarketPotential()}
                    {this.getMarketVolatility()}
                </div>

                    {this.getHelpIcon()}
            </div>)
    }

    private getMarketVolatility() {

        if(!GS.getShoolService().classFinished(SchoolClassList.MarketVolatility)) return ''
        let iconClassVol = GameCalculator.getVolatilityClassIcon(this._businessService.getMarketVolatility())

        return <div className="marketSituation" style={UIHelper.getHiddenClass(SchoolClassList.MarketVolatility)}>
            <span className="sincePotientialTop">Market Volatility</span><br />
            <span className={iconClassVol.c}>
                <FontAwesomeIcon className={iconClassVol.c + ' marketIcon'} icon={iconClassVol.i} /><br />
            </span>
            <span className="sincePotiential">Since: {this._timeService.getFormated('A/C/P', this._volChanged)}</span>

        </div>;
    }

    private getHelpIcon() {
        return <button onClick={()=>{GS.getGlobalEvents().callEvent(EventNames.ShowGameOverlay,this,true)}} className="helpButton"><FontAwesomeIcon className="helpIcon" icon={faQuestion}/></button>
    }

    private getMarketPotential() {

        if(!GS.getShoolService().classFinished(SchoolClassList.MarketPotential)) return ''

        let iconClass = GameCalculator.getPotentialClassIcon(this._businessService.getMarketPerformance())
        return <div className="marketSituation" style={UIHelper.getHiddenClass(SchoolClassList.MarketPotential)}>
            <span className="sincePotientialTop">Market Potential</span><br />
            <span className={iconClass.c}>
                <FontAwesomeIcon className={iconClass.c + ' marketIcon'} icon={iconClass.i} /><br />
            </span>
            <span className="sincePotiential">Since: {this._timeService.getFormated('A/C/P', this._tickChange)}</span>
        </div>;
    }
}