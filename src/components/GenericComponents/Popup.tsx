import { faExpandArrowsAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { GameServices, GlobalEvents } from "../../logic/services";
import { EventNames } from "../../logic/services/Config";
import Draggable from 'react-draggable'

import './Popup.css'

export interface PopupState {
    display: boolean
    title: string
    content: React.ReactNode
    okButtonCallback: undefined | (() => void)
}

export class Popup extends React.Component<{}, PopupState> {

    constructor(prop: {}) {
        super(prop);
        this.state = {
            content: '',
            display: false,
            okButtonCallback: undefined,
            title: 'Popup'
        }
    }

    componentDidMount() {
        GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).subscribe(EventNames.showPopup, (caller, data) => {
            let p = data as PopupState
            this.setState(p)
        })
    }

    render(): React.ReactNode {
        return (<div id="gamePopup">
            <Draggable onStart={(e,data)=>{
            let target = e.target as HTMLElement      
            return target.tagName.toUpperCase() === 'DIV' || target.tagName.toUpperCase() === 'SVG' || target.tagName.toUpperCase() === 'PATH'?undefined:false
        }} >
                <div id="gamePopupWindow" style={UIHelper.isVisible(this.state.display)}>
                    <div className="floatRight dragInfo"><FontAwesomeIcon icon={faExpandArrowsAlt} /></div>
                    <div className="popupHeader">{this.state.title}</div>
                    <div className="popupContent">{this.state.content}</div>
                    <div className="popupFooter">
                        <button className="popupFooterButton" onClick={(e) => { (this.state.okButtonCallback ?? (() => { }))(); this.closePopup() }} style={UIHelper.isVisible(this.state.okButtonCallback !== undefined)}>Ok</button>
                        <button className="buttonClose popupFooterButton" onClick={(e) => { this.closePopup() }}>Close</button>
                    </div>
                </div>
            </Draggable>
        </div>)
    }

    private closePopup() {
        this.setState({ display: false })
    }
}