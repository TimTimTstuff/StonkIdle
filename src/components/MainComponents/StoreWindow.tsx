import { faAward, faBriefcase, faDumpsterFire, faFileInvoice, faInfo, faStore, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { GameCalculator } from "../../logic/module/calculator/GameCalculator";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { SaveManager } from "../../logic/module/saveManager/SaveManager";
import { GlobalEvents, GameServices } from "../../logic/services";
import { AccountService } from "../../logic/services/accounts/AccountService";
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
            window: 'tab0'
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
            case 'tab2':
                content = this.getTab2Content()
                break
            case 'setting':
                content = this.getTabSettings()
                break
            case 'store':
                content = this.getTabStoreContent()
                break
        }
        return (<div className='tabBox'>

            <div style={UIHelper.isVisible(UIHelper.hasTutorialCheck(8))} className='tabBoxHeader'>
                <div onClick={(e) => { this.setState({ window: 'tab1' }) }} className='tabBoxHeaderItem noselect' title="Account Information" ><FontAwesomeIcon icon={faFileInvoice} /></div>
                <div onClick={(e) => { this.setState({ window: 'tab2' }) }} className='tabBoxHeaderItem noselect' title="Goals" ><FontAwesomeIcon icon={faAward} /></div>
                <div onClick={(e) => { this.setState({ window: 'store' }) }} className='tabBoxHeaderItem noselect' title="Store" ><FontAwesomeIcon icon={faStore} /></div>
                <div onClick={(e) => { this.setState({ window: 'setting' }) }} className='tabBoxHeaderItem noselect' title="Game Settings"><FontAwesomeIcon icon={faUserCog} /></div>
            </div>
            <div className='tabBoxContent'>
                {content}
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

    /**
     * Template Line
          <div className='tabBoxContentItem tab1'>Tab 2</div> 
     */
    getTabStoreContent(): React.ReactNode {
        return (<div className='tabBoxContentItem store'>
            {this._store.getItems().length == 0?'Nothing to buy right now. Wait for more stock to come!':''}
            {this._store.getItems().map((i,idx)=>{
            return (<div className="storeItem" key={idx}>
                <div className={`storeItemHeader itemType_${i.itemType}`}>{i.title}</div>
                <div className="storeItemPrice">{GameCalculator.roundValueToEuro(i.price)}</div>
                <div className="storeItemDescription">Time left: {this._timeService.getFormated('C/P',i.avaliableTicks)}</div>
                <div className="storeItemDescription">{i.description}</div>
                <div className="storeItemBuy"><button onClick={(e)=>{
                    this._store.buyItem(i.id)
                }}><FontAwesomeIcon icon={faBriefcase} /></button></div>
            </div>) })}
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

    getTab2Content(): React.ReactNode {
        return (<div className='tabBoxContentItem tab2'><span>Your Goals!</span></div>)
    }
}