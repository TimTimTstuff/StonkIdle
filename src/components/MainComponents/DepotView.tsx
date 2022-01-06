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

                    {allBusiness.sort((a, b) => this.compareBusinessByTotalDepotValue(a, b))
                        .map((a, idx) => {

                            let depot = GameServices.getService<DepotService>(DepotService.serviceName).getDepotByCompanyName(a.shortName)
                            let price = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(a.shortName)
                            let prePrice = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessPrePrices(a.shortName)

                            let isUptrend = (depot?.buyIn ?? 0) > price.s;
                            let sellPrice = GameCalculator.roundValue(price.s * (depot?.shareAmount ?? 0))
                            let buyPrice = GameCalculator.roundValue((depot?.buyIn ?? 0) * (depot?.shareAmount ?? 0))
                            let diffPerc = (GameCalculator.roundValue((100 / buyPrice * sellPrice) - 100))
                            diffPerc = isNaN(diffPerc) ? 0 : diffPerc
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
                                        <span className={'smallNote ' + (isUptrend ? 'downtrend' : 'uptrend')}>{GameFormating.formatPostfix(diffPerc, '%', true, 2)}</span>
                                        <span className={'floatRight priceInfo ' + (isUptrend ? 'downtrend' : 'uptrend')}> {GameFormating.formatPostfix(sellPrice, '€', false, 2)}</span>

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
        let time = GS.getTimeService()
        let thisCirlce = GS.getBusinessCalculator().getCurrentCicleForBusiness(this.state.currentBusiness)
        let thisAge = GS.getBusinessCalculator().getCurrentAgeForBusiness(this.state.currentBusiness)
        if(thisAge == undefined|| thisCirlce == undefined) return;
        return <div className='depotViewItem depotDetails' style={UIHelper.isVisible(UIHelper.hasTutorialCheck(7))}>
            <span>
                {business.name} <small>({business.shortName})</small><br />
            </span>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Sell</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(price.s)}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(price.b)}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Shares</div>
                <div className='detailBoxContent'>{GameFormating.formatToRound(depot?.shareAmount ?? 0, 0)}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Performance</div>
                <div className='detailBoxContent'><FontAwesomeIcon className={iconClassStock.c} icon={iconClassStock.i} /></div>
            </div>
            <div className='clearFloat'></div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy In</div>
                <div className={'detailBoxContent ' + (buySellDiff > 0 ? 'uptrend' : 'downtrend')}>{GameFormating.formatToRoundPostfix(depot.buyIn ?? 0)}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>per Share</div>
                <div className={'detailBoxContent ' + (buySellDiff > 0 ? 'uptrend' : 'downtrend')}>{GameFormating.formatToRoundPostfix(buySellDiff, 2, '€', true)}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Total</div>
                <div className={'detailBoxContent ' + (buySellDiff > 0 ? 'uptrend' : 'downtrend')}>{GameFormating.formatToRoundPostfix(GS.getDepotService().getDepotValueByCompanyName(this.state.currentBusiness))}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Diff</div>
                <div className={'detailBoxContent ' + (buySellDiff > 0 ? 'uptrend' : 'downtrend')}>{GameFormating.formatToRoundPostfix(buySellDiff*depot.shareAmount)}</div>
            </div>
            <div className='clearFloat'></div>

            <button className='buttonSuccess depotActionButton' onClick={() => {
                let tr: TNState = {
                    display: true,
                    pricePerShare: (price.b ?? 0),
                    shortName: this.state.currentBusiness,
                    type: TransfereType.BuyStock,
                    value: 0,
                    buyCallback: (a) => { depotService.buyStock(this.state.currentBusiness, a); this.updateStateWithCurrent(); }
                };

                GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.openTransfereWindow, this, tr);
            }}>Buy</button>
            <button className='buttonSuccess depotActionButton' onClick={() => {
                let tr: TNState = {
                    display: true,
                    pricePerShare: (price.s ?? 0),
                    shortName: this.state.currentBusiness,
                    type: TransfereType.SellStock,
                    value: 0,
                    buyCallback: (a) => { depotService.sellStock(this.state.currentBusiness, a); this.updateStateWithCurrent(); }
                };

                GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.openTransfereWindow, this, tr);
            }}>Sell</button>

            <div>
            <div className='depotDetailInfoHeader'>Info Cicle: {time.getCurrentCicle()}</div>
                        <div className='detailBox'>
                            <div className='detailBoxTitle'>Start</div>
                            <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(thisCirlce.start)}</div>
                        </div>
                        <div className='detailBox'>
                            <div className='detailBoxTitle'>End</div>
                            <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(thisCirlce.end)}</div>
                        </div>
                        <div className='detailBox'>
                            <div className='detailBoxTitle'>High</div>
                            <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(thisCirlce.high)}</div>
                        </div>
                        <div className='detailBox'>
                            <div className='detailBoxTitle'>Low</div>
                            <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(thisCirlce.low)}</div>
                        </div>
                        <div className='clearFloat'></div>
                        <div className='depotDetailInfoHeader'>Info Age: {time.getCurrentAge()}</div>
                        <div className='detailBox'>
                            <div className='detailBoxTitle'>Start</div>
                            <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(thisAge.start)}</div>
                        </div>
                        <div className='detailBox'>
                            <div className='detailBoxTitle'>End</div>
                            <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(thisAge.end)}</div>
                        </div>
                        <div className='detailBox'>
                            <div className='detailBoxTitle'>High</div>
                            <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(thisAge.high)}</div>
                        </div>
                        <div className='detailBox'>
                            <div className='detailBoxTitle'>Low</div>
                            <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(thisAge.low)}</div>
                        </div>
                        <div className='clearFloat'></div>
            </div>
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