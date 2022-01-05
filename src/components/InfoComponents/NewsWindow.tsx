import React from "react";
import { EventNames } from "../../logic/services/Config";
import { GS } from "../../logic/services/GS";
import './NewsWindow.css'

type NewsState = {
    update:string
}

export class NewsWindow extends React.Component<{},NewsState>{

    componentDidMount(){
        GS.getGlobalEvents().subscribe(EventNames.periodChange,() =>{
            this.setState({update:'hello'})
        })
    }

    render(): React.ReactNode {
        return (<div className="newsWindow">
           <h2 className="newsWindowHeader">Market News</h2>
           
        </div>)
    }
}