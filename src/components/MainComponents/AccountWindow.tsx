import React from "react";
import { AccountService } from "../../logic/services/accounts/AccountService";
import { GameServices, GlobalEvents } from "../../logic/services";
import { EventNames } from "../../logic/services/Config";
import './AccountWindow.css'
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { TNState, TransfereType } from "../GenericComponents/TransactionNumbers";
import { GameFormating } from "../../logic/module/calculator/GameFormating";

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
        if(!UIHelper.hasTutorialCheck(1)) return ''
        return (<div  id='accountWindow'> 
            <table>
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
                        <td className="balance">{GameFormating.formatToRoundPostfix(this.state.balance,0)}</td>
                        <td className="balance">{GameFormating.formatToRoundPostfix(this.state.savingBalance,0)}</td>
                        <td className="balance">{GameFormating.formatToRoundPostfix(this.state.creditBalance,0)}</td>
                    </tr>
                    <tr>
                        <td>Interst</td>
                        <td>0%</td>
                        <td>{GameFormating.formatToRoundPostfix(this.state.savingInterest,2,'%')}</td>
                        <td>{GameFormating.formatToRoundPostfix(this.state.creditInterest,2,'%')}</td>
                    </tr>
                    <tr>
                        <td>Periods</td>
                        <td>0</td>
                        <td>{this.state.periodsLeft}</td>
                        <td>{this.state.creditPeriodsLeft}</td>
                    </tr>
                </tbody>
            </table>
            <div className="floatLeft">            
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
            </div>
        </div>)
    }
}