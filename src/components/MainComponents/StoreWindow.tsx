import { faAtlas, faAward, faBriefcase, faDumpsterFire, faFileInvoice, faInfo, faStore, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { GoalsData } from "../../logic/data/GoalsData";
import { GameCalculator } from "../../logic/module/calculator/GameCalculator";
import { GameFormating } from "../../logic/module/calculator/GameFormating";
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
    getTabNumbersContent1(): React.ReactNode {
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
                        <td>{stat.getStat(GameStats.SharesBuyQuantity)}</td>
                        <td>{GameCalculator.roundValueToEuro(stat.getStat(GameStats.SharesBuyAmount))}</td>
                        <td>{stat.getStat(GameStats.SharesSellQuantity)}</td>
                        <td>{GameCalculator.roundValueToEuro(stat.getStat(GameStats.SharesSellAmount))}</td>
                    </tr>
                    <tr>
                        <th className="numTableSpacer" colSpan={8}>Store</th>
                    </tr>
                    <tr>
                        <th>Spend on Items</th>
                        <td>{stat.getStat(GameStats.ItemsAmount)}</td>
                        <th>Total Tax</th>
                        <td>{stat.getStat(GameStats.TaxAmount)}</td>
                    </tr>
                </tbody>
            </table>
        </div>)
    }

    getTabNumbersContent(): React.ReactNode {
        let flag = GameServices.getService<FlagService>(FlagService.serviceName)
        let stat = GameServices.getService<StatsService>(StatsService.serviceName)

        return (<div className='tabBoxContentItem numbers'>
            <div className='depotDetailInfoHeader'>Meta</div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy/Sell Spread</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix((flag.getFlagFloat(GameFlags.g_f_shareSpread) / 10),2,'%')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Chance Item in Store</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(flag.getFlagInt(GameFlags.s_i_itemChance) / 10,0,'%')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Max Item in Store</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(flag.getFlagInt(GameFlags.s_i_maxItems),0,'')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Discount in Store</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(flag.getFlagInt(GameFlags.s_i_discount),0,'%')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>TAX Percentage</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(flag.getFlagInt(GameFlags.g_f_taxPercentage),0,'%')}</div>
            </div>
            <div className='clearFloat'></div>
            
            <div className='depotDetailInfoHeader'>Game Stats</div>
            
            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy Quantity</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesBuyQuantity),0,'')}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy Amount</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesBuyAmount),0)}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Interest</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.InterestAmount),0)}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Items Quantity</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.ItemsQuantity),0)}</div>
            </div>
            
            <div className='clearFloat'></div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Sell Quantity</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesSellQuantity),0,'')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Sell Amount</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesSellAmount),0)}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>TAX</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.TaxAmount),0)}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Items amount</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.ItemsAmount),0)}</div>
            </div>

            <div className='clearFloat'></div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy / Sell</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesSellQuantity)-stat.getStat(GameStats.SharesBuyQuantity),0,'')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy / Sell</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesSellAmount)-stat.getStat(GameStats.SharesBuyAmount),0,'€',true)}</div>
            </div>

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
                    <div className="storeItemTime">Time left: {this._timeService.getFormated('C/P', i.avaliableTicks)}</div>
                    <div className="storeItemDescription">{i.description}</div>
                    <div className="storeItemBuy"><button onClick={(e) => {
                        this._store.buyItem(i.id)
                    }}><FontAwesomeIcon icon={faBriefcase} /></button></div>
                </div>)
            })}
        </div>)
    }

    getTab1Content(): React.ReactNode {
        let taxData = this._accountService.getLastTaxInfo(6)
        let header:string[] = ['Time']
        let content:string[][] = [
            ['Interest'],
            ['Sell Shares'],
            ['Buy Shares'],
            ['Buy Store'],
            ['EBT'],
            ['Tax'],
            ['Total']]
        taxData.forEach((i,id) =>{
            header.push(this._timeService.getFormated('A/C',i.time))
            content[0].push(GameFormating.formatToRoundPostfix(i.interest,0,'€',true))
            content[1].push(GameFormating.formatToRoundPostfix(i.sellShare,0,'€',true))
            content[2].push(GameFormating.formatToRoundPostfix(i.buyShare*-1,0,'€',true))
            content[3].push(GameFormating.formatToRoundPostfix(i.buyItem*-1,0,'€',true))
            content[4].push(GameFormating.formatToRoundPostfix(i.totalIncome,0,'€',true))
            content[5].push(GameFormating.formatToRoundPostfix(i.cost,0,'€',true))
            content[6].push(GameFormating.formatToRoundPostfix(i.totalIncome+i.cost,0,'€',true))
        })

        return (<div className='tabBoxContentItem tab1'>
            
            <table className="taxTable">
            <thead>
                <tr>
                    {header.map((i,idx)=>(<th key={idx}>{i}</th>))}
                </tr>
            </thead>
            <tbody>
                {content.map((cBox,idx)=>{
                    return (<tr key={idx}>
                        {
                        cBox.map((c, idc)=>{
                            if(idc === 0){
                                return (<th key={idc}>{c}</th>)
                            }else{
                                return (<td key={idc} className={c.indexOf('-')===0?'downtrend':'uptrend'}>{c}</td>)
                            }
                            
                        }) 
                        }
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
                        <div className="goalItemHeader">{g.name} <small>({g.level}/{g.maxLevel})</small></div>
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