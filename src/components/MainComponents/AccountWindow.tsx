import React from "react";
import { AccountService } from "../../logic/services/accounts/AccountService";
import { GameServices, GlobalEvents } from "../../logic/services";
import { EventNames } from "../../logic/services/Config";
import './AccountWindow.css'
import { GameCalculator } from "../../logic/module/calculator/GameCalculator";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { TNState, TransfereType } from "../GenericComponents/TransactionNumbers";
import { InfoBubble } from "../GenericComponents/InfoBubble";
import { GS } from "../../logic/services/GS";

type AccountWindowState = {
    balance: number
    savingBalance: number
    savingInterest: number
    periodsLeft: number
    creditBalance: number
    creditInterest: number
    creditPeriodsLeft: number
}

export class AccountWindow extends React.Component<{}, AccountWindowState> {
    private _account: AccountService;

    constructor(prop: {}) {
        super(prop);
        this._account = GameServices.getService<AccountService>(AccountService.serviceName)
        this.state = {
            balance: this._account.getMainAccountBalance(),
            savingBalance: this._account.getSavingBalance(),
            periodsLeft: this._account.getSavingInterestLeft(),
            savingInterest: this._account.getSavingInterest(),
            creditBalance: this._account.getCreditBalance(),
            creditInterest: this._account.getCreditInterest(),
            creditPeriodsLeft: this._account.getCreditInterestLeft()
        }
    }

    componentDidMount(){
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.periodChange, (caller, args) => {
            this.UpdateStateData();
        })
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.moneyUpdate, (caller, args) => {
            this.UpdateStateData();
        })
    }

    private UpdateStateData() {
        this.setState({
            balance: this._account.getMainAccountBalance(),
            savingBalance: this._account.getSavingBalance(),
            periodsLeft: this._account.getSavingInterestLeft(),
            savingInterest: this._account.getSavingInterest(),
            creditBalance: this._account.getCreditBalance(),
            creditInterest: this._account.getCreditInterest(),
            creditPeriodsLeft: this._account.getCreditInterestLeft()
        });
    }

    render(): React.ReactNode {
        return (<div  id='accountWindow'> 
            <table style={UIHelper.isVisible(UIHelper.hasTutorialCheck(1))}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Main Account</th>
                        <th>Savings Account</th>
                        <th>Credit Account</th>
                        </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Balance</td>
                        <td className="balance">{GameCalculator.roundValueToEuro(this.state.balance)}</td>
                        <td className="balance">{GameCalculator.roundValueToEuro(this.state.savingBalance)}</td>
                        <td className="balance">{GameCalculator.roundValueToEuro(this.state.creditBalance)}</td>
                    </tr>
                    <tr>
                        <td>Interst</td>
                        <td>0%</td>
                        <td>{GameCalculator.roundValue(this.state.savingInterest)}%</td>
                        <td>{GameCalculator.roundValue(this.state.creditInterest)}%</td>
                    </tr>
                    <tr>
                        <td>Periods</td>
                        <td>0</td>
                        <td>{this.state.periodsLeft}</td>
                        <td>{this.state.creditPeriodsLeft}</td>
                    </tr>
                </tbody>
            </table>
            <div className="floatLeft" style={UIHelper.isVisible(UIHelper.hasTutorialCheck(2))}>            
               <button onClick={(e)=>{
                   let tr: TNState = {
                       display:true,
                       pricePerShare:1,
                       shortName:'',
                       type: TransfereType.TransfToCredit,
                       value:0,
                       buyCallback:(a)=>{this._account.transfereMainToCredit(a)}
                   }
                   GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.openTransfereWindow,this,tr)
               }}>Pay Credit</button>

                <button onClick={(e)=>{
                   let tr: TNState = {
                       display:true,
                       pricePerShare:1,
                       shortName:'',
                       type: TransfereType.StoreSaving,
                       value:0,
                       buyCallback:(a)=>{this._account.transfereMainToSaving(a)}
                   }
                   GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.openTransfereWindow,this,tr)
               }}>Savings</button>

               <button onClick={(e)=>{
                   let tr: TNState = {
                       display:true,
                       pricePerShare:1,
                       shortName:'',
                       type: TransfereType.TransfFromCredit,
                       value:0,
                       buyCallback:(a)=>{this._account.transfereCreditToMain(a)}
                   }
                   GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.openTransfereWindow,this,tr)
               }}>Get Credit</button>     

               <InfoBubble title="Your Accounts" content={GS.getInfoData().getInfoBubble_AccountWindow()} />          
            </div>
        </div>)
    }
}