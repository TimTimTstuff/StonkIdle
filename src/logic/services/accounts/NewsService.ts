import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { GlobalEvents } from "..";
import { IGameService } from "../IGameService";

export enum NewsType {
    BusinessPerformance,
    MarketPerformance,
    MarketVolatility,
    BusinessNews,
    StoreUpdate,
}

export class NewsService implements IGameService{
    
    //#region service
    public static serviceName: string = 'NewsService'
    getServiceName(): string {
        return NewsService.serviceName
    }
    //#endregion

    private _event: GlobalEvents

    constructor(event:GlobalEvents) {
        this._event = event
    }

    createNews(type:NewsType, title:string, body:string, icon:IconDefinition, color:string, shortName?:string ){
        
    }

}