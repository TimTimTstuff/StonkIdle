import { faFileInvoice, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { GameCalculator } from "../logic/module/calculator/GameCalculator";
import { GameServices, GlobalEvents } from "../logic/services";
import { AccountService } from "../logic/services/accounts/AccountService";
import { EventNames } from "../logic/services/Config";
import { TimeService } from "../logic/services/timeService/TimeService";
import './StoreWindow.css'

type StoreStage = {
    window:string
}

export class StoreWindow extends React.Component<{},StoreStage> {
    private _accountService: AccountService;
    private _timeService: TimeService;
    private _eventService: GlobalEvents;
    
    constructor(prop:{}) {
        super(prop);
        this.state = {
            window:'tab1'
        }
        this._accountService = GameServices.getService<AccountService>(AccountService.serviceName)
        this._timeService = GameServices.getService<TimeService>(TimeService.serviceName)
        this._eventService = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)

       
    }

    componentDidMount(){
        console.log('Mount Store Window')
        this._eventService.subscribe(EventNames.periodChange, (caller, args) =>{
            this.setState({window:this.state.window})
        })
    }

    render(): React.ReactNode {
        
        return (<div className='tabBox'>
        <div className='tabBoxHeader'>
          <div onClick={(e)=>{this.setState({window:'tab1'})}} className='tabBoxHeaderItem noselect' title="Account Information" ><FontAwesomeIcon icon={faFileInvoice} /></div>
          {/*} <div onClick={(e)=>{this.setState({window:'tab2'})}} className='tabBoxHeaderItem noselect'>Depot</div> {*/}
          {/*} <div onClick={(e)=>{this.setState({window:'tab3'})}} className='tabBoxHeaderItem noselect'>Depot</div>{*/}
          {/*} <div onClick={(e)=>{this.setState({window:'tab4'})}} className='tabBoxHeaderItem noselect'>Depot</div>{*/}
          {/*} <div onClick={(e)=>{this.setState({window:'tab5'})}} className='tabBoxHeaderItem noselect'>Depot</div>{*/}
          <div onClick={(e)=>{this.setState({window:'tab6'})}} className='tabBoxHeaderItem noselect' title="Game Settings"><FontAwesomeIcon  icon={faUserCog}/></div>
        </div>
        <div className='tabBoxContent'>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab1'?{display:'block'}:{display:'none'})}>{this.getTab1Content()}</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab2'?{display:'block'}:{display:'none'})}>Tab 2</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab3'?{display:'block'}:{display:'none'})}>Tab 3</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab4'?{display:'block'}:{display:'none'})}>Tab 4</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab5'?{display:'block'}:{display:'none'})}>Tab 5</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab6'?{display:'block'}:{display:'none'})}>Tab 6</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab7'?{display:'block'}:{display:'none'})}>Tab 7</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab8'?{display:'block'}:{display:'none'})}>Tab 8</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab9'?{display:'block'}:{display:'none'})}>Tab 9</div>
          <div className='tabBoxContentItem tab1' style={(this.state.window == 'tab10'?{display:'block'}:{display:'none'})}>Tab 10</div>
        </div>
      </div>)
    }
    getTab1Content(): React.ReactNode {
        let taxData = this._accountService.getLastTaxInfo(10)
        return (<table className="taxTable">
                <thead>
                <tr>
                    <th>Time</th>
                    <th>Buy</th>
                    <th>Sell</th>
                    <th>Interest</th>
                    <th>Total</th>
                    <th>Tax</th>
                </tr>
                </thead>
                <tbody>
                    {taxData.map((i,idx)=>{
                        return (
                        <tr key={idx}>
                            <td>{this._timeService.getFormated('A/C',i.time)}</td>
                            <td>-{GameCalculator.roundValueToEuro(i.buyShare)}</td>
                            <td>+{GameCalculator.roundValueToEuro(i.sellShare)}</td>
                            <td>+{GameCalculator.roundValueToEuro(i.interest)}</td>
                            <td>{GameCalculator.roundValueToEuro(i.totalIncome)}</td>
                            <td>{GameCalculator.roundValueToEuro(i.cost)}</td>

                        </tr>)
                    })}
                </tbody>
                </table>)
    }
}