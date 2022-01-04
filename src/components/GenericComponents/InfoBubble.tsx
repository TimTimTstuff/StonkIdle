import { faInfo, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { EventNames } from "../../logic/services/Config";
import { GS } from "../../logic/services/GS";
import {PopupState} from './Popup'
import './InfoBubble.css'

type InfoBubbleProp = {
    title:string
    content:React.ReactNode
}

type InfoBubbleState = {
    title:string
    content:React.ReactNode
}

export class InfoBubble extends React.Component<InfoBubbleProp, InfoBubbleState> {

    /**
     *
     */
    constructor(prop:InfoBubbleProp) {
        super(prop);
        this.state = {
            title: prop.title,
            content: prop.content
        }   
    }

    render(): React.ReactNode {
        return (<button className="infoBubbleButton" onClick={()=>{
            GS.getGlobalEvents().callEvent(EventNames.showPopup, this, ({title:this.state.title, content:this.props.content, display:true} as PopupState) )
        }}><FontAwesomeIcon icon={faInfoCircle} /></button>)
    }

}