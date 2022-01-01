import React from "react";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { GameServices, GlobalEvents } from "../../logic/services";
import { AccountService } from "../../logic/services/accounts/AccountService";
import { BusinessCalculator } from "../../logic/services/businessCalculator/BusinessCalculator";
import { EventNames } from "../../logic/services/Config";
import './TransactionNumbers.css'
import Draggable from 'react-draggable'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpandArrowsAlt } from "@fortawesome/free-solid-svg-icons";

export enum TransfereType {
    StoreSaving,
    BuyStock,
    SellStock
}

export interface TNState {
    buyCallback: (amount: number) => void,
    type: TransfereType,
    display: boolean,
    value:number,
    shortName:string,
    pricePerShare:number,
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

    componentDidMount(){

        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.openTransfereWindow,(caller, args)=>{
            let s = args as TNState
            this.setState(s)
        })

        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.periodChange,(caller,args)=>{
            if(this.state.type === TransfereType.BuyStock){
                let price = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(this.state.shortName)
                this.setState({
                    pricePerShare: price.b
                })
            }else if(this.state.type === TransfereType.SellStock){
                let price = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(this.state.shortName)
                this.setState({
                    pricePerShare: price.s
                })
            }
        })

    }

    //#region render
    render(): React.ReactNode {
        
        let subline = this.state.type == TransfereType.StoreSaving?'For Saving Account':this.getSubLineForBuySell()
        
        return (<div> <Draggable><div style={UIHelper.isVisible(this.state.display)} id='tnBox' className="tnBoxContainer">
             <div className="floatRight"><FontAwesomeIcon icon={faExpandArrowsAlt} /></div>
            <span className="tnBoxHeader">Buy / Sell Calculator</span>
            <br />
           
            <input className="tnBoxInput" type='number' readOnly={false} value={this.state.value} min='0' onChange={(e) => { this.setState({value: parseInt(e.target.value)}) }} />
            <br/>
            {subline}
            <br/>
            <button onClick={(e)=>{this.state.buyCallback(this.state.value)}} style={UIHelper.isVisible(this.state.type == TransfereType.BuyStock)} className="tnBoxBuyButton">Buy</button>
            <button onClick={(e)=>{this.state.buyCallback(this.state.value)}} style={UIHelper.isVisible(this.state.type == TransfereType.SellStock)} className="tnBoxSellButton">Sell</button>
            <button onClick={(e)=>{this.state.buyCallback(this.state.value)}} style={UIHelper.isVisible(this.state.type == TransfereType.StoreSaving)} className="tnBoxStoreButton">Store</button>
            <button className="tnBoxInputResetButton" onClick={(e)=>{this.setState({value:0})}}>Reset</button>
            <button className="tnBoxCloseButton" onClick={(e)=>{this.setState({display:false})}}>Close</button>
            <table>
                <tbody>
                    {this.getBuyNumberPositive()}
                    {this.getBuyNumberNegative()}
                    {this.getBuyPercentagePositive()}
                </tbody>
            </table>
        </div></Draggable></div>)
    }

    private getSubLineForBuySell(){
        return (<span>For: {this.state.shortName} | Mode: {this.state.type == TransfereType.SellStock?'Sell':'Buy'} | Share: {this.state.pricePerShare}€</span>)

    }

    private getBuyPercentagePositive() {
        return <tr>
            <td><button onClick={(e)=>{this.addValuePercentMain(1)}}>+1%</button></td>
            <td><button onClick={(e)=>{this.addValuePercentMain(10)}}>+10%</button></td>
            <td><button onClick={(e)=>{this.addValuePercentMain(25)}}>+25%</button></td>
            <td><button onClick={(e)=>{this.addValuePercentMain(75)}}>+75%</button></td>
            <td><button onClick={(e)=>{this.addValuePercentMain(100)}}>+100%</button></td>
        </tr>;
    }
    addValuePercentMain(percent: number) {
        let currAmount = GameServices.getService<AccountService>(AccountService.serviceName).getMainAccountBalance();
        let percMoney = Math.floor(currAmount/100*percent)
        if(this.state.type == TransfereType.StoreSaving){
            this.addValue(percMoney)
        }else if(this.state.type == TransfereType.BuyStock || this.state.type == TransfereType.SellStock){
            let stocks = Math.floor(percMoney/this.state.pricePerShare)
            this.addValue(stocks)
        }
    }

    private getBuyNumberNegative() {
        return <tr>
            <td><button onClick={(e)=>{this.addValue(-1)}}>-1</button></td>
            <td><button onClick={(e)=>{this.addValue(-10)}}>-10</button></td>
            <td><button onClick={(e)=>{this.addValue(-100)}}>-100</button></td>
            <td><button onClick={(e)=>{this.addValue(-1000)}}>-1000</button></td>
            <td><button onClick={(e)=>{this.addValue(-10000)}}>-10000</button></td>
        </tr>;
    }

    private getBuyNumberPositive() {
        return <tr>
            <td><button onClick={(e)=>{this.addValue(1)}}>+1</button></td>
            <td><button onClick={(e)=>{this.addValue(10)}}>+10</button></td>
            <td><button onClick={(e)=>{this.addValue(100)}}>+100</button></td>
            <td><button onClick={(e)=>{this.addValue(1000)}}>+1000</button></td>
            <td><button onClick={(e)=>{this.addValue(10000)}}>+10000</button></td>
        </tr>;
    }

    private addValue(a:number){
        let nVal = this.state.value+a
        if(nVal < 0){
            nVal = 0
        }
        this.setState({value:nVal})
    }
    //#endregion

}