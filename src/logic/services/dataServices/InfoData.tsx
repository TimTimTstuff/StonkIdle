import { IGameService } from "../IGameService";

export class InfoData implements IGameService {
    getInfoBubble_Depot(): import("react").ReactNode {
        return (<span>Lel</span>)
    }
    getInfoBubble_Chart(): import("react").ReactNode {
        return (<span>Lel</span>)
    }
    getInfoBubble_AccountWindow(): import("react").ReactNode {
        return (<span>Lel</span>)
    }
  
    //#region service
    public static serviceName: string = 'InfoData'
    getServiceName(): string {
       return InfoData.serviceName
    }
    //#endregion

    public getInfoBubble_TimeWindow() {
        return (<span>The Time in this game is calculated in Ticks.
            <ul>
                <li>100 Ticks = 1 Period</li>
                <li>100 Periods = 1 Cicle</li>
                <li>100 Cicle = 1 Age</li>
            </ul>
            Currently you gain ~4 Ticks per Second. This can change during the game.<br/>
            You could see Periods = Days and Cicle = Year<br/>

            <small><i>I decided to add a own Time-Calculation to have more freedom on how it's calculated and seperated instead using our real Time.</i></small>
        </span>)
    }

}