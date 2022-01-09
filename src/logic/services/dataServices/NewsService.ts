import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React from "react";
import { GlobalEvents } from "..";
import { EventNames, GameConfig, GameFlags } from "../Config";
import { GS } from "../GS";
import { IGameService } from "../IGameService";
import { FlagService } from "../saveData/FlagService";
import { SaveDataService } from "../saveData/SaveDataService";

export interface NewsData{
    icon:IconDefinition,
    cssClass:string,
    title:string
    news:string | React.ReactNode
    cTime:number
}

export class NewsService implements IGameService{
    private _save: SaveDataService;
    private _event: GlobalEvents;
    //#region service
    getServiceName(): string {
        return NewsService.serviceName
    }
    public static serviceName: string = 'NewsService'
    //#endregion

    constructor(save: SaveDataService, event: GlobalEvents, flag: FlagService) {
        this._save = save        
        this._event = event
        this._event.subscribe(EventNames.periodChange,(caller, args)=>{
            if(flag.getFlagInt(GameFlags.n_n_AbonementTime) > 0){
                flag.addToFlag(GameFlags.n_n_AbonementTime,-1)
            }
        })
    }

    private cleanNews(){
        if(this._save.getGameSave().news.length >= GameConfig.maxNews){
            this._save.getGameSave().news.pop()
        }
    }

    public addNews(title:string, news:string|React.ReactNode, icon:IconDefinition, color:string){
        this.cleanNews()
        let newNews = {title: title, news:news,cTime:GS.getTimeService().getTicks(), icon:icon, cssClass:color}
        this._save.getGameSave().news.unshift(newNews)
        this._event.callEvent(EventNames.newNews,this,newNews)
    }

    public getAllNews() {
        return this._save.getGameSave().news
    }

}