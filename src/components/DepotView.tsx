import React from 'react'
import { GameServices, GlobalEvents } from '../logic/services';
import { DepotService } from '../logic/services/accounts/DepotService';
import { BusinessCalculator } from '../logic/services/businessCalculator/BusinessCalculator';
import { EventNames } from '../logic/services/Config';
import './DepotView.css'

type DepotViewState = {
    currentBusiness: string
}

export class DepotView extends React.Component<{},DepotViewState> {

    constructor(prop:{}) {
        super(prop);
        this.state = {
            currentBusiness:''
        }


    }

    render(): React.ReactNode {
        let allBusiness = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness()
        let cDepot = GameServices.getService<DepotService>(DepotService.serviceName)
        let depot = cDepot.getDepotByCompanyName(this.state.currentBusiness)
        let business = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusiness(this.state.currentBusiness)
        return (
            <div id='depots' className='depotView'>
                <div className='depotViewItem depotList'>
                   {allBusiness.map((a,idx) => {
                       let depot = GameServices.getService<DepotService>(DepotService.serviceName).getDepotByCompanyName(a.shortName)
                       return  <div key={idx} data-shortname={a.shortName} className='depotListItem noselect' onClick={(e)=>{this.selectCompany(a.shortName)
                       }}>
                    <span>{a.name}</span><span>{a.shortName}</span><span>{depot?.shareAmount}</span>
                    </div>})}
                </div>
                <div className='depotViewItem depotDetails'>Selected: {this.state.currentBusiness} 
                <table>
                    <tbody>
                        <tr><td>Owned:</td><td>{depot?.shareAmount}</td><td>Float/Total</td><td>{business?.floatingStock}/{business?.totalStock}</td></tr>
                        <tr><td>Buy In:</td><td>{depot?.buyIn}€</td><td></td></tr>
                    </tbody>
                </table>
                <button onClick={(e)=>{cDepot.buyStock(this.state.currentBusiness, 10)}}>Buy 10</button>
                <button onClick={(e)=>{cDepot.sellStock(this.state.currentBusiness, 10)}}>Sell 10</button>
                </div>
            </div>
        )
    }

    selectCompany(shortName:string) {
        this.setState({currentBusiness:shortName})
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.selectedBusiness,this,shortName)
    }

}