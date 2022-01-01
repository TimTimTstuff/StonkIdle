import React from "react";
import { AccountService } from "../../logic/services/accounts/AccountService";
import { GameServices, GlobalEvents } from "../../logic/services";
import { EventNames } from "../../logic/services/Config";
import './AccountWindow.css'
import { GameCalculator } from "../../logic/module/calculator/GameCalculator";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { TNState, TransfereType } from "../GenericComponents/TransactionNumbers";

type AccountWindowState = {
    balance: number
    savingBalance: number
    savingInterest: number
    periodsLeft: number
}

export class AccountWindow extends React.Component<{}, AccountWindowState> {
    private _account: AccountService;
    /**
     *
     */
    constructor(prop: {}) {
        super(prop);
        this._account = GameServices.getService<AccountService>(AccountService.serviceName)
        this.state = {
            balance: this._account.getMainAccountBalance(),
            savingBalance: this._account.getSavingBalance(),
            periodsLeft: this._account.getSavingInterestLeft(),
            savingInterest: this._account.getSavingInterest()
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
            savingInterest: this._account.getSavingInterest()
        });
    }

    render(): React.ReactNode {
        return (<div  id='accountWindow'> 

            <table style={UIHelper.isVisible(UIHelper.hasTutorialCheck(1))}>
                <thead>
                    <tr><th>#</th><th>Main Account</th><th>Savings Account</th><td ></td></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Balance</td><td className="balance">{GameCalculator.roundValueToEuro(this.state.balance)}</td>
                        <td className="balance">{GameCalculator.roundValueToEuro(this.state.savingBalance)}</td>

                    </tr>
                    <tr>
                        <td>Interst</td><td>0%</td><td>{this.state.savingInterest}%</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Periods</td><td>0</td><td>{this.state.periodsLeft}</td><td></td>
                    </tr>

                </tbody>
            </table>
            <div className="floatLeft" style={UIHelper.isVisible(UIHelper.hasTutorialCheck(2))}>
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
               }}>Store to Savings</button>
            </div>
        </div>)
    }
}