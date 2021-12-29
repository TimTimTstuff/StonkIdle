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
                <div className='depotViewItem depotDetails'>Selected: {this.state.currentBusiness}</div>
            </div>
        )
    }

    selectCompany(shortName:string) {
        this.setState({currentBusiness:shortName})
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.selectedBusiness,this,shortName)
    }

}