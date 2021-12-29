import React from "react";
import { AccountService } from "../logic/services/accounts/AccountService";
import { GameServices, GlobalEvents } from "../logic/services";
import { EventNames } from "../logic/services/Config";
import './AccountWindow.css'

type AccountWindowState = {
    balance:number
    savingBalance:number
    savingInterest:number
    periodsLeft:number
}

export class AccountWindow extends React.Component<{},AccountWindowState> {
    /**
     *
     */
    constructor(prop:{}) {
        super(prop);
        let account = GameServices.getService<AccountService>(AccountService.serviceName)
        this.state = {
            balance: account.getMainAccountBalance(),
            savingBalance: account.getSavingBalance(),
            periodsLeft: account.getSavingInterestLeft(),
            savingInterest: account.getSavingInterest()
        }

        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.periodChange,(caller, args) =>{
            let account = GameServices.getService<AccountService>(AccountService.serviceName)
            this.setState({
                balance: account.getMainAccountBalance(),
                savingBalance: account.getSavingBalance(),
                periodsLeft: account.getSavingInterestLeft(),
                savingInterest: account.getSavingInterest()
            })
        })

        
    }

    render(): React.ReactNode {
        
        return (<div id='accountWindow'>

            <table>
                <thead>
                    <tr><th>#</th><th>Main Account</th><th>Savings Account</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Balance</td><td className="balance">{Math.round(this.state.balance*100)/100}€</td><td className="balance">{Math.round(this.state.savingBalance*100)/100}€</td>
                    </tr>
                    <tr>
                        <td>Interst</td><td>0%</td><td>{this.state.savingInterest}%</td>
                        </tr>
                    <tr>
                        <td>Periods</td><td>0</td><td>{this.state.periodsLeft}</td>
                    </tr>
                    
                </tbody>
            </table>
        </div>)
    }
}