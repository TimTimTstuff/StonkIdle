import React from "react";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { GameServices, GlobalEvents } from "../../logic/services";
import { AccountService } from "../../logic/services/accounts/AccountService";
import { BusinessCalculator } from "../../logic/services/businessCalculator/BusinessCalculator";
import { EventNames } from "../../logic/services/Config";
import './TransactionNumbers.css'
import Draggable from 'react-draggable'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faExpandArrowsAlt, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { DepotService } from "../../logic/services/accounts/DepotService";
import { GameCalculator } from "../../logic/module/calculator/GameCalculator";

export enum TransfereType {
    StoreSaving,
    BuyStock,
    SellStock,
    TransfToCredit,
    TransfFromCredit
}

export interface TNState {
    buyCallback: (amount: number) => void,
    type: TransfereType,
    display: boolean,
    value: number,
    shortName: string,
    pricePerShare: number,
}


export class TransactionNumbers extends React.Component<{}, TNState>{



    constructor(prop: {}) {
        super(prop);
        this.state = {
            display: false,
            buyCallback: (e) => { console.log(`Amount: ${e}`) },
            type: TransfereType.StoreSaving,
            value: 0,
            shortName: '',
            pricePerShare: 1,
        }
       
    }

    componentDidMount() {
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.openTransfereWindow, (caller, args) => {
            let s = args as TNState
            this.setState(s)
        })

        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.periodChange, (caller, args) => {
            if (this.state.type === TransfereType.BuyStock) {
                let price = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(this.state.shortName)
                this.setState({
                    pricePerShare: price.b
                })
            } else if (this.state.type === TransfereType.SellStock) {
                let price = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(this.state.shortName)
                this.setState({
                    pricePerShare: price.s
                })
            }
        })
    }

    //#region render
    render(): React.ReactNode {
        let subline = this.state.type === TransfereType.StoreSaving ? 'For Saving Account' : this.getSubLineForBuySell()

        return (<div> <Draggable onStart={(e,data)=>{
            let target = e.target as HTMLElement      
            return target.tagName.toUpperCase() === 'DIV' || target.tagName.toUpperCase() === 'SVG' || target.tagName.toUpperCase() === 'PATH'?undefined:false
        }} ><div style={UIHelper.isVisible(this.state.display)} id='tnBox' className="tnBoxContainer">
            <button title="Close Window" className="floatRight tnBoxCloseButton" onClick={(e) => { this.setState({ display: false }) }}><FontAwesomeIcon icon={faTimes} /></button>
            <div title="Dragg window" className="floatRight dragInfo"><FontAwesomeIcon icon={faExpandArrowsAlt} /></div>
            <div className="tnBoxHeader">Buy / Sell Calculator</div>
            <input title="Amount to be used" className="tnBoxInput" type='number' readOnly={false} value={this.state.value} min='0' onChange={(e) => { this.setState({ value: parseInt(e.target.value) }) }} />
            {subline}
            <button title="Buy/Sell or Store" onClick={(e) => { this.state.buyCallback(this.state.value); this.setState({display:false}) }} className="tnBoxBuyButton"><FontAwesomeIcon icon={faBriefcase} /></button>
            <button title="Reset Input" className="tnBoxInputResetButton" onClick={(e) => { this.setState({ value: 0 }) }}><FontAwesomeIcon icon={faTrash} /></button>
            <table>
                <tbody>
                    {this.getBuyNumberPositive()}
                    {this.getBuyNumberNegative()}
                    {this.getBuyPercentagePositive()}
                </tbody>
            </table>
        </div></Draggable></div>)
    }

    private getSubLineForBuySell() {
        return (<div>
              <span>{this.state.type === TransfereType.SellStock ? 'Sell' : 'Buy'}</span>: <span>{this.state.shortName}</span> <span>{this.state.pricePerShare}€</span> <span>Total: {GameCalculator.roundValueToEuro(this.state.pricePerShare*this.state.value)}</span>
            </div>)
    }

    private getBuyPercentagePositive() {
        return <tr>
            <td><button onClick={(e) => { this.addValuePercentMain(1) }}>+1%</button></td>
            <td><button onClick={(e) => { this.addValuePercentMain(10) }}>+10%</button></td>
            <td><button onClick={(e) => { this.addValuePercentMain(25) }}>+25%</button></td>
            <td><button onClick={(e) => { this.addValuePercentMain(75) }}>+75%</button></td>
            <td><button onClick={(e) => { this.addValuePercentMain(100) }}>+100%</button></td>
        </tr>;
    }

    addValuePercentMain(percent: number) {
        let currAmount = GameServices.getService<AccountService>(AccountService.serviceName).getMainAccountBalance();
        let percMoney = Math.floor(currAmount / 100 * percent)
        if (this.state.type === TransfereType.StoreSaving) {
            this.addValue(percMoney)
        } else if (this.state.type === TransfereType.BuyStock) {
            let stocks = Math.floor(percMoney / this.state.pricePerShare)
            this.addValue(stocks)
        } else if(this.state.type === TransfereType.SellStock){
            let sAm = GameServices.getService<DepotService>(DepotService.serviceName).getDepotByCompanyName(this.state.shortName)
            if((sAm?.shareAmount??0) <= 0) return;
            let p = Math.floor((sAm?.shareAmount??0) / 100 * percent)
            this.addValue(p)
        } else if(this.state.type === TransfereType.TransfFromCredit){
            let sam = GameServices.getService<AccountService>(AccountService.serviceName).creditAccountLeft()
            let borrow = sam / 100 * percent
            this.addValue(Math.floor(borrow))
        } else if(this.state.type === TransfereType.TransfToCredit){
            let sac = GameServices.getService<AccountService>(AccountService.serviceName)
            let money = sac.getMainAccountBalance()
            let cred = sac.getCreditBalance() / 100 * percent
            let max = cred*-1
            if(money > max){
                this.addValue(Math.floor(max))
            }else{
                this.addValue(Math.floor(money))
            }
        }
    }

    private getBuyNumberNegative() {
        return <tr>
            <td><button onClick={(e) => { this.addValue(-1) }}>-1</button></td>
            <td><button onClick={(e) => { this.addValue(-10) }}>-10</button></td>
            <td><button onClick={(e) => { this.addValue(-100) }}>-100</button></td>
            <td><button onClick={(e) => { this.addValue(-1000) }}>-1000</button></td>
            <td><button onClick={(e) => { this.addValue(-10000) }}>-10000</button></td>
        </tr>;
    }

    private getBuyNumberPositive() {
        return <tr>
            <td><button onClick={(e) => { this.addValue(1) }}>+1</button></td>
            <td><button onClick={(e) => { this.addValue(10) }}>+10</button></td>
            <td><button onClick={(e) => { this.addValue(100) }}>+100</button></td>
            <td><button onClick={(e) => { this.addValue(1000) }}>+1000</button></td>
            <td><button onClick={(e) => { this.addValue(10000) }}>+10000</button></td>
        </tr>;
    }

    private addValue(a: number) {
        let nVal = this.state.value + a
        if (nVal < 0) {
            nVal = 0
        }
        this.setState({ value: nVal })
    }
    //#endregion

}