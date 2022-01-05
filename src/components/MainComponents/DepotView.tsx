import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { GameCalculator } from '../../logic/module/calculator/GameCalculator';
import { GameFormating } from '../../logic/module/calculator/GameFormating';
import { UIHelper } from '../../logic/module/calculator/UiHelper';
import { GameServices, GlobalEvents } from '../../logic/services';
import { DepotService } from '../../logic/services/accounts/DepotService';
import { BusinessCalculator } from '../../logic/services/businessCalculator/BusinessCalculator';
import { EventNames, GameConfig } from '../../logic/services/Config';
import { GS } from '../../logic/services/GS';
import { TimeService } from '../../logic/services/timeService/TimeService';
import { DepotData } from '../../model/AccountData';
import { Business } from '../../model/Business';
import { InfoBubble } from '../GenericComponents/InfoBubble';
import { PopupState } from '../GenericComponents/Popup';
import { TNState, TransfereType } from '../GenericComponents/TransactionNumbers';
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
    }

    componentDidMount() {
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.periodChange, () => {
            this.updateStateWithCurrent();
        })
    }

    private updateStateWithCurrent() {
        this.setState({ currentBusiness: this.state.currentBusiness });
    }

    render(): React.ReactNode {
        let allBusiness = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness()
        let cDepot = GameServices.getService<DepotService>(DepotService.serviceName)
        let totalInStock = cDepot.getDepotTotalValue()

        return (
            <div id='depots' className='depotView'>
                <div style={UIHelper.isVisible(UIHelper.hasTutorialCheck(6))} className='depotViewItem depotList'>
                    <div className='depotListItem noselect depotListItemHeader'>
                        <div className='depotViewData'>
                            <div className='floatLeft'>
                                <span className='compName'>Total:</span>
                            </div>
                            <div className='floatRight priceInfo'>
                                <span className='uptrend'>{GameFormating.formatToRoundPostfix(totalInStock)}</span>
                            </div>
                        </div>
                    </div>

                    {allBusiness.sort((a, b) => this.compareBusinessByTotalDepotValue(a, b) )
                    .map((a, idx) => {

                        let depot = GameServices.getService<DepotService>(DepotService.serviceName).getDepotByCompanyName(a.shortName)
                        let price = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(a.shortName)
                        let prePrice = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessPrePrices(a.shortName)

                        let isUptrend = (depot?.buyIn ?? 0) > price.s;
                        let sellPrice = GameCalculator.roundValue(price.s * (depot?.shareAmount ?? 0))
                        let buyPrice = GameCalculator.roundValue((depot?.buyIn ?? 0) * (depot?.shareAmount ?? 0))
                        let diffPerc = (GameCalculator.roundValue((100/buyPrice * sellPrice)-100))
                        diffPerc = isNaN(diffPerc)?0:diffPerc
                        let icon = price.s > prePrice.s ? faAngleUp : faAngleDown

                        return <div key={idx} data-shortname={a.shortName} className='depotListItem noselect' onClick={() => {
                            this.selectCompany(a.shortName)
                        }}>
                            <div className='depotViewData'>
                                <div className='depotViewDataHeader'>
                                    <span className='compName'>{a.name}</span>
                                    <span className={(price.s < prePrice.s ? 'downtrend' : 'uptrend')}> <FontAwesomeIcon className={price.s < prePrice.s ? 'downtrend' : 'uptrend'} icon={icon} /></span>
                                </div>
                                <div className='depotViewDataBody'>
                                    <span className='sharesAmount'><small>x{depot?.shareAmount}</small></span>
                                    <span className={'smallNote ' + (isUptrend ? 'downtrend' : 'uptrend')}>{(isUptrend ? '' : '+')}{diffPerc}%</span>
                                    <span className={'floatRight priceInfo ' + (isUptrend ? 'downtrend' : 'uptrend')}> {GameFormating.formatPostfix(sellPrice)}</span>
                                    
                                </div>
                            </div>
                        </div>
                    })}
                </div>

                {this.getBusinessDepotRender()}
            </div>
        )
    }

    private getBusinessDepotRender() {
      let business = GS.getBusinessCalculator().getBusiness(this.state.currentBusiness) as Business
      let depot = GS.getDepotService().getDepotByCompanyName(this.state.currentBusiness) as DepotData
      let depotService = GS.getDepotService()
      let iconClassStock = GameCalculator.getPotentialClassIcon(business.potential)
      let buySellDiff = GS.getDepotService().getDepotBuySellDiff(this.state.currentBusiness)
      let price = GS.getBusinessCalculator().getBusinessCurrentPrices(this.state.currentBusiness)
      let thisCirlce = GS.getBusinessCalculator().getCurrentCicleForBusiness(this.state.currentBusiness)
      let thisAge = GS.getBusinessCalculator().getCurrentAgeForBusiness(this.state.currentBusiness)
      return <div className='depotViewItem depotDetails' style={UIHelper.isVisible(UIHelper.hasTutorialCheck(7))}>
            {business.name} <small>({business.shortName})</small><br />

           
            <button onClick={() => {
                let tr: TNState = {
                    display: true,
                    pricePerShare: (price.b ?? 0),
                    shortName: this.state.currentBusiness,
                    type: TransfereType.BuyStock,
                    value: 0,
                    buyCallback: (a) => { depotService.buyStock(this.state.currentBusiness, a); this.updateStateWithCurrent(); }
                };

                GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.openTransfereWindow, this, tr);
            } }>Buy</button>
            <button onClick={() => {
                let tr: TNState = {
                    display: true,
                    pricePerShare: (price.s ?? 0),
                    shortName: this.state.currentBusiness,
                    type: TransfereType.SellStock,
                    value: 0,
                    buyCallback: (a) => { depotService.sellStock(this.state.currentBusiness, a); this.updateStateWithCurrent(); }
                };

                GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.openTransfereWindow, this, tr);
            } }>Sell</button>
            <button onClick={() => { 
                GS.getGlobalEvents().callEvent(EventNames.showPopup,this,({
                    display:true,
                    title: `Info: ${business.name}`,
                    content:  (<table>
                        <tbody>
                            <tr>
                                <td>Owned:</td>
                                <td>{depot?.shareAmount}</td>
                                <td>Performance</td>
                                <td><FontAwesomeIcon className={iconClassStock.c} icon={iconClassStock.i} /></td>
                            </tr>
                            <tr>
                                <td>Buy In:</td><td>{depot.buyIn}€</td><td>Value:</td><td className={buySellDiff > 0 ? 'uptrend' : 'downtrend'}>{buySellDiff}€</td>
                            </tr>
                            <tr>
                                <td>Sell:</td><td>{price.s}€</td><td>Buy:</td><td>{price.b}€</td>
                            </tr>
        
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
                        </tbody>
                    </table>)
                } as PopupState))
            } }>Info</button>
        </div>;
    }

    private compareBusinessByTotalDepotValue(a: Business, b: Business) {
        let depotCompA = GameServices.getService<DepotService>(DepotService.serviceName).getDepotByCompanyName(a.shortName);
        let priceCompA = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(a.shortName);
        let depotCompB = GameServices.getService<DepotService>(DepotService.serviceName).getDepotByCompanyName(b.shortName);
        let priceCompB = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(b.shortName);
        let result = (depotCompB?.shareAmount ?? 0) * priceCompB.s - ((depotCompA?.shareAmount ?? 0) * priceCompA.s);

        return result;
    }

    private selectCompany(shortName: string) {
        this.setState({ currentBusiness: shortName })
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.selectedBusiness, this, shortName)
    }

}