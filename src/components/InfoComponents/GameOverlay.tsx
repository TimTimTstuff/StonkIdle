import React from "react";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { EventNames } from "../../logic/services/Config";
import { GS } from "../../logic/services/GS";
import { InfoBubble } from "../GenericComponents/InfoBubble";
import './GameOverlay.css'
type OverlayState = {
    display:boolean
}
export class GameOverlay extends React.Component<{},OverlayState>{
    
    /**
     *
     */
    constructor(prop:{}) {
        super(prop);
        this.state = {display: false}
    }

    componentDidMount(){
        
        GS.getGlobalEvents().subscribe(EventNames.ShowGameOverlay,(caller, isVisible)=>{
            this.setState({display:isVisible===true})
        }) 
    }

    render(): React.ReactNode {
        return (<div className="gameOverlay" style={UIHelper.isVisible(this.state.display)}>
            <div className="gameOverlayInfoText">
                <h2>Help and FAQ</h2>
                All question and additional information about the game will be collected here. 
                Currently there is no Information, i will add this based on the feedback.
                <br/>
                <br/>
                <button onClick={()=>{this.setState({display:false})}}>Close</button>
            </div>
            <div style={{top:'300px',left:'200px'}} className="gameOverlayInfoBubble">
            <InfoBubble title="Example Info" content={(<div>This is how the Info Buttons can look like!</div>)}  />
            </div>
        </div>)
    }
}