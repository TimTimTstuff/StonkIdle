import { faAtlas, faAward, faBriefcase, faDumpsterFire, faFileInvoice, faInfo, faStore, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { GoalsData } from "../../logic/data/GoalsData";
import { GameCalculator } from "../../logic/module/calculator/GameCalculator";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { GlobalEvents, GameServices } from "../../logic/services";
import { AccountService } from "../../logic/services/accounts/AccountService";
import { GameStats, StatsService } from "../../logic/services/accounts/StatsService";
import { StoreManager } from "../../logic/services/businessCalculator/StoreManager";
import { EventNames, GameFlags } from "../../logic/services/Config";
import { FlagService } from "../../logic/services/saveData/FlagService";
import { SaveDataService } from "../../logic/services/saveData/SaveDataService";
import { TimeService } from "../../logic/services/timeService/TimeService";
import { PopupState } from "../GenericComponents/Popup";
import './StoreWindow.css'

type StoreStage = {
    window: string
}

export class StoreWindow extends React.Component<{}, StoreStage> {
    private _accountService: AccountService;
    private _timeService: TimeService;
    private _eventService: GlobalEvents;
    private _flag: FlagService
    private _store: StoreManager;

    constructor(prop: {}) {
        super(prop);
        this.state = {
            window: 'tab1'
        }
        this._flag = GameServices.getService<FlagService>(FlagService.serviceName)
        this._accountService = GameServices.getService<AccountService>(AccountService.serviceName)
        this._timeService = GameServices.getService<TimeService>(TimeService.serviceName)
        this._eventService = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        this._store = GameServices.getService<StoreManager>(StoreManager.serviceName)

    }

    componentDidMount() {
        this._eventService.subscribe(EventNames.periodChange, (caller, args) => {
            this.setState({ window: this.state.window })
        })
    }

    render(): React.ReactNode {
        let content: string | React.ReactNode = ''
        switch (this.state.window) {
            case 'tab1':
                content = this.getTab1Content()
                break
            case 'goal':
                content = this.getGoalContent()
                break
            case 'setting':
                content = this.getTabSettings()
                break
            case 'store':
                content = this.getTabStoreContent()
                break
            case 'numbers':
                content = this.getTabNumbersContent()
                break
        }
        return (<div className='tabBox'>

            <div style={UIHelper.isVisible(UIHelper.hasTutorialCheck(8))} className='tabBoxHeader'>
                <div onClick={(e) => { this.setState({ window: 'tab1' }) }} className='tabBoxHeaderItem noselect' title="Account Information" ><FontAwesomeIcon icon={faFileInvoice} /></div>
                <div onClick={(e) => { this.setState({ window: 'goal' }) }} className='tabBoxHeaderItem noselect' title="Goals" ><FontAwesomeIcon icon={faAward} /></div>
                <div onClick={(e) => { this.setState({ window: 'store' }) }} className='tabBoxHeaderItem noselect' title="Store" ><FontAwesomeIcon icon={faStore} /></div>
                <div onClick={(e) => { this.setState({ window: 'numbers' }) }} className='tabBoxHeaderItem noselect' title="All numbers" ><FontAwesomeIcon icon={faAtlas} /></div>
                <div onClick={(e) => { this.setState({ window: 'setting' }) }} className='tabBoxHeaderItem noselect' title="Game Settings"><FontAwesomeIcon icon={faUserCog} /></div>

            </div>
            <div className='tabBoxContent'>
                {content}
            </div>
        </div>)
    }
    
    /**
     * Template Line
          <div className='tabBoxContentItem tab1'>Tab 2</div> 
     */
    getTabNumbersContent(): React.ReactNode {
        let flag = GameServices.getService<FlagService>(FlagService.serviceName)
        let stat = GameServices.getService<StatsService>(StatsService.serviceName)
        return (<div className='tabBoxContentItem numbers'>
            <table className="numbersTable">
                <tbody>
                    <tr>
                        <th className="numTableSpacer" colSpan={6}>Shares</th>
                    </tr>
                    <tr>
                        <th>Buy/Sell Spread:</th>
                        <td>{GameCalculator.roundValue((flag.getFlagFloat(GameFlags.g_f_shareSpread) / 10), 3)}%</td>

                    </tr>
                    <tr>
                        <th className="numTableSpacer" colSpan={6}>Store</th>
                    </tr>
                    <tr>
                        <th>Store Item Chance <small>(per Period)</small>:</th>
                        <td>{flag.getFlagInt(GameFlags.s_i_itemChance) / 10}%</td>
                        <th>Max store Items:</th>
                        <td>{flag.getFlagInt(GameFlags.s_i_maxItems)}</td>
                        <th>Store Discount:</th>
                        <td>{flag.getFlagInt(GameFlags.s_i_discount)}%</td>
                    </tr>
                    <tr>
                        <th className="numTableSpacer" colSpan={6}>Living</th>
                    </tr>
                    <tr>
                        <th>Tax:</th>
                        <td>{flag.getFlagInt(GameFlags.g_f_taxPercentage)}%</td>
                    </tr>
                </tbody>
            </table>
            <span>Statistics</span>
            <table className="numbersTable">
                <tbody>
                    <tr>
                        <th className="numTableSpacer" colSpan={8}>Shares</th>
                    </tr>
                    <tr>
                        <th>Buy</th>
                        <th>Buy €</th>
                        <th>Sell</th>
                        <th>Sell €</th>
                    </tr>
                    <tr>
                        <td>{stat.getStat(GameStats.BuyedSharesTotal)}</td>
                        <td>{GameCalculator.roundValueToEuro(stat.getStat(GameStats.BuyPriceTotal))}</td>
                        <td>{stat.getStat(GameStats.SellForShare)}</td>
                        <td>{GameCalculator.roundValueToEuro(stat.getStat(GameStats.SellPriceTotal))}</td>
                    </tr>
                    <tr>
                        <th className="numTableSpacer" colSpan={8}>Store</th>
                    </tr>
                    <tr>
                        <th>Spend on Items</th>
                        <td>{stat.getStat(GameStats.SpendOnItems)}</td>
                        <th>Total Tax</th>
                        <td>{stat.getStat(GameStats.PayedForTax)}</td>
                    </tr>
                </tbody>
            </table>
        </div>)
    }

    getTabSettings(): React.ReactNode {
        return (<div className='tabBoxContentItem setting'>
            <table>
                <tbody>
                    <tr>
                        <td>Restart Tutorial</td>
                        <td><button onClick={(e) => {
                            this._flag.setFlag(GameFlags.t_b_active, true)
                            this._flag.setFlag(GameFlags.t_i_level, 0)
                            this._eventService.callEvent(EventNames.periodChange, this, null)
                        }}><FontAwesomeIcon className="helpIcon" icon={faInfo} /></button></td>
                        <td>Reset Save</td>
                        <td><button onClick={(e) => {
                            let pop: PopupState = {
                                content: (<b className="downtrend">Reset the Save?</b>),
                                display: true,
                                title: 'RESET THE SAFE',
                                okButtonCallback: () => { GameServices.getService<SaveDataService>(SaveDataService.serviceName).resetSave() }
                            }
                            this._eventService.callEvent(EventNames.showPopup, this, pop)
                        }}><FontAwesomeIcon className="dangerIcon" icon={faDumpsterFire} /></button></td>
                    </tr>
                </tbody>
            </table>
        </div>)
    }

    getTabStoreContent(): React.ReactNode {
        return (<div className='tabBoxContentItem store'>
            {this._store.getItems().length === 0 ? 'Nothing to buy right now. Wait for more stock to come!' : ''}
            {this._store.getItems().map((i, idx) => {
                return (<div className="storeItem" key={idx}>
                    <div className={`storeItemHeader itemType_${i.itemType}`}>{i.title}</div>
                    <div className="storeItemPrice">{GameCalculator.roundValueToEuro(i.price)}</div>
                    <div className="storeItemDescription">Time left: {this._timeService.getFormated('C/P', i.avaliableTicks)}</div>
                    <div className="storeItemDescription">{i.description}</div>
                    <div className="storeItemBuy"><button onClick={(e) => {
                        this._store.buyItem(i.id)
                    }}><FontAwesomeIcon icon={faBriefcase} /></button></div>
                </div>)
            })}
        </div>)
    }

    getTab1Content(): React.ReactNode {
        let taxData = this._accountService.getLastTaxInfo(10)
        return (<div className='tabBoxContentItem tab1'><table className="taxTable">
            <thead>
                <tr>
                    <th className="taxTableTime">Time</th>

                    <th>Sell</th>
                    <th>Interest</th>
                    <th>Buy</th>
                    <th>Store</th>
                    <th>Total</th>
                    <th>Tax</th>
                </tr>
            </thead>
            <tbody>
                {taxData.map((i, idx) => {
                    return (
                        <tr key={idx}>
                            <td className="taxTableTime">{this._timeService.getFormated('A/C', i.time)}</td>

                            <td className="uptrend">+{GameCalculator.roundValueToEuro(i.sellShare)}</td>
                            <td className="uptrend">+{GameCalculator.roundValueToEuro(i.interest)}</td>
                            <td className="downtrend">-{GameCalculator.roundValueToEuro(i.buyShare)}</td>
                            <td className="downtrend">-{GameCalculator.roundValueToEuro(i.buyItem)}</td>
                            <td className={(i.totalIncome > 0 ? 'uptrend' : 'downtrend')}>{GameCalculator.roundValueToEuro(i.totalIncome)}</td>
                            <td className={(i.cost > 0 ? 'uptrend' : 'downtrend')}>{GameCalculator.roundValueToEuro(i.cost)}</td>

                        </tr>)
                })}
            </tbody>
        </table></div>)
    }

    getGoalContent(): React.ReactNode {
        let gs = GameServices.getService<GoalsData>(GoalsData.serviceName)

        return (<div className='tabBoxContentItem goal'>
            {gs.getListCurrentGoals().map((g, gId) => {
                return (
                    <div key={gId} className="goalItem floatLeft">
                        <div className="goalItemHeader">{g.name}</div>
                        <div className="goalItemInfo">
                            <div className="goalItemProgress" style={{ width: g.percentReached + '%' }}>
                                {g.percentReached}%
                            </div>
                        </div>
                        <div className="goalItemInfo">
                            {GameCalculator.roundValueToEuro(g.currValue)}/{GameCalculator.roundValueToEuro(g.goal)}
                        </div>
                        <div className="goalItemPrice">{UIHelper.getGoalPriceName(g.price)}</div>
                    </div>)
            })}
        </div>)
    }
}