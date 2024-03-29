import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faAtlas, faAward, faBriefcase, faDumpsterFire, faFileInvoice, faGraduationCap, faInfo, faSchool, faStore, faUniversity, faUserCog } from "@fortawesome/free-solid-svg-icons";
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
import { EventNames, GameConfig, GameFlags } from "../../logic/services/Config";
import { SchoolClass, SchoolClassList } from "../../logic/services/dataServices/SchoolService";
import { GS } from "../../logic/services/GS";
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

        this._flag = GameServices.getService<FlagService>(FlagService.serviceName)
        this._accountService = GameServices.getService<AccountService>(AccountService.serviceName)
        this._timeService = GameServices.getService<TimeService>(TimeService.serviceName)
        this._eventService = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        this._store = GameServices.getService<StoreManager>(StoreManager.serviceName)
        let last = this._flag.getFlagString(GameFlags.sw_s_lastTab)
        this.state = {
            window: last == '' ? 'goal' : last
        }

    }

    componentDidMount() {
        this._eventService.subscribe(EventNames.periodChange, (caller, args) => {
            this.setState({ window: this.state.window })
        })
    }

    render(): React.ReactNode {
        if(!UIHelper.hasTutorialCheck(4)) return ''
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
            case 'school':
                content = this.getTabSchoolContent()
                break
        }
        this._flag.setFlag(GameFlags.sw_s_lastTab, this.state.window)
        return (<div className='tabBox'>

            <div className='tabBoxHeader'>
                {this.getRenderTab1Button()}
                <div onClick={(e) => { this.setState({ window: 'goal' }) }} className='tabBoxHeaderItem noselect' title="Goals" ><FontAwesomeIcon icon={faAward} /></div>
                {this.getRenderTabStoreButton()}
                <div onClick={(e) => { this.setState({ window: 'school' }) }} className='tabBoxHeaderItem noselect' title="School"><FontAwesomeIcon icon={faGraduationCap} /></div>
                {this.getRenderTabNumbersButton()}
                <div onClick={(e) => { this.setState({ window: 'setting' }) }} className='tabBoxHeaderItem noselect' title="Game Settings"><FontAwesomeIcon icon={faUserCog} /></div>

            </div>
            <div className='tabBoxContent'>
                {content}
            </div>
        </div>)
    }

    private getRenderTab1Button() {
        if(!GS.getShoolService().classFinished(SchoolClassList.StoreSeeTab1)) return
        return <div onClick={(e) => { this.setState({ window: 'tab1' }); } } className='tabBoxHeaderItem noselect' title="Account Information"><FontAwesomeIcon icon={faFileInvoice} /></div>;
    }

    private getRenderTabNumbersButton() {
        if (!GS.getShoolService().classFinished(SchoolClassList.StoreSeeNumbers)) return
        return <div onClick={(e) => { this.setState({ window: 'numbers' }); }} className='tabBoxHeaderItem noselect' title="All numbers"><FontAwesomeIcon icon={faAtlas} /></div>;
    }

    private getRenderTabStoreButton() {
        if (!GS.getShoolService().classFinished(SchoolClassList.StoreSeeStoreTab)) return

        return <div onClick={(e) => { this.setState({ window: 'store' }); }} className='tabBoxHeaderItem noselect' title="Store"><FontAwesomeIcon icon={faStore} /></div>;
    }

    /**
     * Template Line
          <div className='tabBoxContentItem tab1'>Tab 2</div> 
     */
    getTabSchoolContent(): React.ReactNode {
        let current = GS.getShoolService().getCurrentClass()
        let currentClass = GS.getShoolService().getClassById(current?.id??0)
        return (<div className='tabBoxContentItem school'>
            {GS.getShoolService().getAvaliableClasses().map((c, id) => {
                let perc = c.id === current?.id ? 100 / c.periodsToFinish * (current?.p ?? 0) : 0
                let pp = GameFormating.formatToRoundPostfix(perc, 2, '%')
                return (<div key={id} className="schoolItem">
                    <div className="schoolItemHeader">{c.title}
                        {this.getRanderShoolGetClassButton(c,currentClass)}

                    </div>

                    <div className="schoolItemContent">
                        <div className="schoolItemContentDescription">{c.description}</div>
                        <div className="schoolItemContentProgress">
                            <div style={{ width: pp }} className="schoolItemContentPro">{pp}</div>
                        </div>
                    </div>
                    <div className="schoolItemFooter">
                        {c.periodsToFinish} Periods a {GameFormating.formatToRoundPostfix(c.pricePerPeriod)} per Period

                    </div>
                </div>)
            }
            )}

        </div>)
    }

    private getRanderShoolGetClassButton(c: SchoolClass, current: SchoolClass| undefined) {
        if(current !== undefined && c.id === current.id){
            return <button onClick={(e) => { this._eventService.callEvent(EventNames.showPopup,this,({title:'Stop School', content:'When you stop the class you lose all your progress!',display:true,okButtonCallback:()=>{GS.getShoolService().stopSchool(); this.setState({window:this.state.window})}} as PopupState)) } } className="">Stop</button>; 
        }else if(current !== undefined){
            return ''
        }else
        {
            return <button onClick={(e) => { GS.getShoolService().startClass(c.id); this.setState({window:this.state.window}) } } className="">Learn</button>;
        }
    }

    getTabNumbersContent(): React.ReactNode {
        let flag = GameServices.getService<FlagService>(FlagService.serviceName)
        let stat = GameServices.getService<StatsService>(StatsService.serviceName)
        let secPerPeriod = GameFormating.formatToRoundPostfix(100 / (1000 / (flag.getFlagInt(GameFlags.g_i_gameLoopTickSpeed)) * flag.getFlagFloat(GameFlags.g_i_ticksPerLoop)), 0, ' sec');

        return (<div className='tabBoxContentItem numbers'>
            <div className='depotDetailInfoHeader'>Meta</div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy/Sell Spread</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix((flag.getFlagFloat(GameFlags.g_f_shareSpread) / 10), 2, '%')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Chance Item in Store</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(flag.getFlagInt(GameFlags.s_i_itemChance) / 10, 0, '%')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Max Item in Store</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(flag.getFlagInt(GameFlags.s_i_maxItems), 0, '')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Discount in Store</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(flag.getFlagInt(GameFlags.s_i_discount), 0, '%')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>TAX Percentage</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(flag.getFlagInt(GameFlags.g_f_taxPercentage), 0, '%')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Time per Period</div>
                <div className='detailBoxContent'>{secPerPeriod}</div>
            </div>
            <div className='clearFloat'></div>

            <div className='depotDetailInfoHeader'>Game Stats</div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy Quantity</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesBuyQuantity), 0, '')}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy Amount</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesBuyAmount), 0)}</div>
            </div>
            <div className='detailBox'>
                <div className='detailBoxTitle'>Interest</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.InterestAmount), 0)}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Item Quantity</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.ItemsQuantity), 0, '')}</div>
            </div>

            <div className='clearFloat'></div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Sell Quantity</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesSellQuantity), 0, '')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Sell Amount</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesSellAmount), 0)}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>TAX</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.TaxAmount), 0)}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Items amount</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.ItemsAmount), 0)}</div>
            </div>

            <div className='clearFloat'></div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy / Sell</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesSellQuantity) - stat.getStat(GameStats.SharesBuyQuantity), 0, '')}</div>
            </div>

            <div className='detailBox'>
                <div className='detailBoxTitle'>Buy / Sell</div>
                <div className='detailBoxContent'>{GameFormating.formatToRoundPostfix(stat.getStat(GameStats.SharesSellAmount) - stat.getStat(GameStats.SharesBuyAmount), 0, '€', true)}</div>
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
                    <tr>
                        <td>Game Version</td>
                        <td>{GameConfig.saveVersion}</td>
                        <td>Last Update</td>
                        <td>{GameConfig.lastGameUpdate}</td>
                    </tr>
                    <tr>
                        <td>Contact</td>
                        <td style={{ textAlign: 'center' }}><a href="https://discord.gg/4HZrm2v" rel='noreferrer' target={'_blank'}><small style={{ fontSize: '6pt' }}>https://discord.gg/4HZrm2v</small><br /> <FontAwesomeIcon icon={faDiscord} /></a></td>
                    </tr>
                </tbody>
            </table>
        </div>)
    }

    getTabStoreContent(): React.ReactNode {
        return (<div className='tabBoxContentItem store'>
            {this._store.getItems().length === 0 ? (<small className="noItemsInStore">Nothing to buy right now. More goods are on the way!</small>) : ''}
            {this._store.getItems().map((i, idx) => {
                return (<div className="storeItem" key={idx}>
                    <div className={`storeItemHeader itemType_${i.itemType}`}>{i.title}</div>
                    <div className="storeItemPrice">{GameCalculator.roundValueToEuro(i.price)}</div>
                    <div className="storeItemTime">Time left: {this._timeService.getFormated('C/P', i.avaliableTicks)}</div>
                    <div className="storeItemDescription">{i.description}</div>
                    <div className="storeItemBuy"><button onClick={(e) => {
                        this._store.buyItem(i.id)
                    }}>Buy</button></div>
                </div>)
            })}
        </div>)
    }

    getTab1Content(): React.ReactNode {
        let taxData = this._accountService.getLastTaxInfo(6)
        let header: string[] = ['Time']
        let content: string[][] = [
            ['Interest'],
            ['Sell Shares'],
            ['Buy Shares'],
            ['Store / School'],
            ['EBT'],
            ['Tax'],
            ['Total']]
        taxData.forEach((i, id) => {
            header.push(this._timeService.getFormated('A/C', i.time))
            content[0].push(GameFormating.formatToRoundPostfix(i.interest, 0, '€', true))
            content[1].push(GameFormating.formatToRoundPostfix(i.sellShare, 0, '€', true))
            content[2].push(GameFormating.formatToRoundPostfix(i.buyShare * -1, 0, '€', true))
            content[3].push(GameFormating.formatToRoundPostfix(i.buyItem * -1, 0, '€', true))
            content[4].push(GameFormating.formatToRoundPostfix(i.totalIncome, 0, '€', true))
            content[5].push(GameFormating.formatToRoundPostfix(i.cost, 0, '€', true))
            content[6].push(GameFormating.formatToRoundPostfix(i.totalIncome + i.cost, 0, '€', true))
        })

        return (<div className='tabBoxContentItem tab1'>

            <table className="taxTable">
                <thead>
                    <tr>
                        {header.map((i, idx) => (<th key={idx}>{i}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {content.map((cBox, idx) => {
                        return (<tr key={idx}>
                            {
                                cBox.map((c, idc) => {
                                    if (idc === 0) {
                                        return (<th key={idc}>{c}</th>)
                                    } else {
                                        return (<td key={idc} className={c.indexOf('-') === 0 ? 'downtrend' : 'uptrend'}>{c}</td>)
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
        let goalContent: React.ReactNode = (<small className="noItemsInStore">No Goals left. Congratulations!</small>)

        if (gs.getListCurrentGoals().length > 0) {
            goalContent = gs.getListCurrentGoals().map((g, gId) => {
                return (
                    <div key={gId} className="goalItem floatLeft">
                        <div className="goalItemHeader">{g.name} <br /><small>({g.level}/{g.maxLevel})</small></div>
                        <div className="goalItemInfo">
                            <div className="goalItemProgress" style={{ width: g.percentReached + '%' }}>
                                {g.percentReached}%
                            </div>
                        </div>
                        <div className="goalItemInfoValue">
                            {GameCalculator.roundValueToEuro(g.currValue)}/{GameCalculator.roundValueToEuro(g.goal)}
                        </div>
                        <div className="goalItemPrice">{UIHelper.getGoalPriceName(g.price)}</div>
                    </div>)
            })
        }

        return (<div className='tabBoxContentItem goal'>
            {goalContent}
        </div>)
    }
}