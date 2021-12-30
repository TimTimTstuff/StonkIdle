import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Game } from '../logic/Game';
import { GameCalculator } from '../logic/module/calculator/GameCalculator';
import { GameServices, GlobalEvents } from '../logic/services';
import { DepotService } from '../logic/services/accounts/DepotService';
import { BusinessCalculator } from '../logic/services/businessCalculator/BusinessCalculator';
import { EventNames, GameConfig } from '../logic/services/Config';
import { TimeService } from '../logic/services/timeService/TimeService';
import './DepotView.css'

type DepotViewState = {
    currentBusiness: string
}

export class DepotView extends React.Component<{}, DepotViewState> {

    constructor(prop: {}) {
        super(prop);
        this.state = {
            currentBusiness: GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness()[0].shortName
        }

        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.periodChange, (caller, args) => {
            this.updateStateWithCurrent();
        })

    }

    private updateStateWithCurrent() {
        this.setState({ currentBusiness: this.state.currentBusiness });
    }

    render(): React.ReactNode {
        let allBusiness = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness()
        let cDepot = GameServices.getService<DepotService>(DepotService.serviceName)
        let time = GameServices.getService<TimeService>(TimeService.serviceName)
        let depot = cDepot.getDepotByCompanyName(this.state.currentBusiness)
        let business = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusiness(this.state.currentBusiness)
        let businessService = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName)
        let last = business?.stockPriceHistory[business.stockPriceHistory.length - 1]
        let thisCirlce = business?.historyCicle[time.getFormated(GameConfig.CicleHistoryDateFormat, time.getTicks())]
        let thisAge = business?.historyAge[time.getFormated(GameConfig.AgeHistoryDateFormat, time.getTicks())]
        


        return (
            <div id='depots' className='depotView'>
                <div className='depotViewItem depotList'>
                    {allBusiness.map((a, idx) => {
                        let depot = GameServices.getService<DepotService>(DepotService.serviceName).getDepotByCompanyName(a.shortName)
                        let price = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(a.shortName)
                        let prePrice = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessPrePrices(a.shortName)
                        let isUptrend = (depot?.buyIn ?? 0) > price.s;
                        let sellPrice = GameCalculator.roundValue(price.s * (depot?.shareAmount ?? 0))
                        let buyPrice = GameCalculator.roundValue((depot?.buyIn ?? 0) * (depot?.shareAmount ?? 0))
                        let diff = GameCalculator.roundValue(sellPrice  - buyPrice)
                        let icon = price.s > prePrice.s ? faAngleUp : faAngleDown
                        return <div key={idx} data-shortname={a.shortName} className='depotListItem noselect' onClick={(e) => {
                            this.selectCompany(a.shortName)
                        }}>
                            <div className='depotViewData'>

                                <div className='floatLeft'>
                                    <span className='compName'>{a.name}</span><br />
                                    <span className='shortName'>{a.shortName}</span>
                                    <span className='compName'> Shares: {depot?.shareAmount}</span>
                                    <span className={(price.s < prePrice.s?'downtrend':'uptrend')}> <FontAwesomeIcon className={price.s < prePrice.s?'downtrend':'uptrend'} icon={icon}/></span>
                                </div>
                                <div className='floatRight price'>
                                    <span className={'priceInfo ' + (isUptrend ? 'downtrend' : 'uptrend')}>{sellPrice}€
                                        <br/><span className={'smallNote ' + (isUptrend ? 'downtrend' : 'uptrend')}>
                                            {(isUptrend ? '' : '+')}{diff}€
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    })}
                </div>
                <div className='depotViewItem depotDetails'>{this.state.currentBusiness}
                    <table>
                        <tbody>

                            <tr>
                                <td>Owned:</td>
                                <td>{depot?.shareAmount}</td>
                                <td>Float/Total</td>
                                <td>{business?.floatingStock}/{business?.totalStock}</td>
                            </tr>
                            <tr>

                            </tr>
                            <tr>
                                <td>Buy In:</td><td>{depot?.buyIn}€</td><td>Value:</td><td>{GameCalculator.roundValueToEuro((last?.sellPrice ?? 0) - (depot?.buyIn ?? 0))}</td>
                            </tr>
                            <tr>
                                <td>Sell:</td><td>{last?.sellPrice}€</td><td>Buy:</td><td>{last?.buyPrice}€</td>
                            </tr>
                            {/*}
                            <tr>
                                <td>f.Sell:</td><td>{first?.sellPrice}€</td><td>f. Buy:</td><td>{first?.buyPrice}€</td>
                            </tr>
                            {*/}

                            <tr>
                                <td colSpan={4} className='tableSpacer'>This Cicle</td></tr>
                            <tr>
                                <td>High:</td><td>{thisCirlce?.high}€</td><td>Low:</td><td>{thisCirlce?.low}€</td>
                            </tr>
                            <tr>
                                <td>Start:</td><td>{thisCirlce?.start}€</td><td>End:</td><td>{thisCirlce?.end}€</td>
                            </tr>

                            <tr>
                                <td colSpan={4} className='tableSpacer'>This Age</td>
                            </tr>
                            <tr>
                                <td>High:</td><td>{thisAge?.high}€</td><td>Low:</td><td>{thisAge?.low}€</td>
                            </tr>
                            <tr>
                                <td>Start:</td><td>{thisAge?.start}€</td><td>End:</td><td>{thisAge?.end}€</td>
                            </tr>
                            <tr>
                                <td colSpan={4} className='tableSpacer'>Other</td>
                            </tr>
                            <tr>
                                <td>Performance:</td><td>{business?.potential}</td><td>Market:</td><td>{businessService.getMarketPerformance()}</td>
                            </tr>


                        </tbody>
                    </table>
                    <button onClick={(e) => { cDepot.buyStock(this.state.currentBusiness, 1); this.updateStateWithCurrent() }}>Buy 1</button>
                    <button onClick={(e) => { cDepot.buyStock(this.state.currentBusiness, 10); this.updateStateWithCurrent() }}>Buy 10</button>
                    <button onClick={(e) => { cDepot.buyStock(this.state.currentBusiness, 100); this.updateStateWithCurrent() }}>Buy 100</button>
                    <button onClick={(e) => { cDepot.buyStock(this.state.currentBusiness, 100); this.updateStateWithCurrent() }}>Buy 1000</button>
                    <button onClick={(e) => { cDepot.sellStock(this.state.currentBusiness, 1); this.updateStateWithCurrent() }}>Sell 1</button>
                    <button onClick={(e) => { cDepot.sellStock(this.state.currentBusiness, 10); this.updateStateWithCurrent() }}>Sell 10</button>
                    <button onClick={(e) => { cDepot.sellStock(this.state.currentBusiness, 100); this.updateStateWithCurrent() }}>Sell 100</button>
                    <button onClick={(e) => { cDepot.sellStock(this.state.currentBusiness, 100); this.updateStateWithCurrent() }}>Sell 1000</button>
                </div>
            </div>
        )
    }

    selectCompany(shortName: string) {
        this.setState({ currentBusiness: shortName })
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.selectedBusiness, this, shortName)
    }

}