import React from "react";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { GameServices, GlobalEvents } from "../../logic/services";
import { EventNames } from "../../logic/services/Config";

import './Popup.css'

export interface PopupState  {
    display:boolean
    title:string
    content:React.ReactNode
    okButtonCallback:undefined|(()=>void)
}


export class Popup extends React.Component<{},PopupState> {

    /**
     *
     */
    constructor(prop:{}) {
        super(prop);
        this.state  = {
            content:'',
            display:false,
            okButtonCallback:undefined,
            title:'Popup'
        }
    }

    componentDidMount(){
        console.log('mount popup')
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.showPopup,(caller, data) =>{
            let p = data as PopupState
            this.setState(p) 
        })
    }
    

    render(): React.ReactNode {
        return (<div id="gamePopup">
            <div id="gamePopupWindow" style={UIHelper.isVisible(this.state.display)}>
            <div className="popupHeader">{this.state.title}</div>
            <div className="popupContent">{this.state.content}</div>
            <div className="popupFooter">
                <button className="popupFooterButton" onClick={(e)=>{ (this.state.okButtonCallback??(()=>{}))();this.close() }} style={UIHelper.isVisible(this.state.okButtonCallback != undefined)}>Ok</button>
                <button className="buttonClose popupFooterButton" onClick={(e)=>{this.close()}}>Close</button>
            </div>
            </div>
        </div>)
    }

    close() {
        this.setState({display:false})
    }
}