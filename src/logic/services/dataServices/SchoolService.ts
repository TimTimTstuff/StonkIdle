import { GlobalEvents } from "..";
import { EventNames } from "../Config";
import { GS } from "../GS";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";

export enum SchoolClassList{

}

export interface SchoolClass {
    id:SchoolClassList,
    periodsToFinish:number,
    pricePerPeriod:number,
    title:string,
    description:string
}

export class SchoolService implements IGameService{
    private _save: SaveDataService
    private _event: GlobalEvents
    private _classes: SchoolClass[]
    //#region service
    getServiceName(): string {
        return SchoolService.serviceName
    }
    public static serviceName: string = 'SchoolService'
    //#endregion

    constructor(save:SaveDataService, event:GlobalEvents) {
        this._save = save
        this._event = event
        this._classes = this.setupClasses()
        this._event.subscribe(EventNames.periodChange,(caller, args)=>{
            let savedShool = this._save.getGameSave().player.currentSchool
            if(savedShool === undefined) return
            let cClass = this.getClassById(savedShool.id)
            if(cClass === undefined) return
            if(GS.getAccountService().hasMainAmount(cClass.pricePerPeriod)){
                this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough fundings to pay for School!`, key:'warn'})
                return
            }
            savedShool.p += 1
            GS.getAccountService().removeMainAccount(cClass.pricePerPeriod,'School Fee',true,true)
            if(savedShool.p >= cClass.periodsToFinish){
                this.processClass(cClass)
                this.stopSchool()
            }
            
        })
    }

    processClass(cClass: SchoolClass) {
       console.log('Class process')
    }

    public startClass(school:SchoolClassList) {
        let c = this.getClassById(school)
        this._save.getGameSave().player.currentSchool = {id:school,p:0}
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Started School: ${c?.title}`, key:'info'})
    }

    public stopSchool(){
        this._save.getGameSave().player.currentSchool = undefined
        this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Stopped School!`, key:'info'})
    }

    public getClassById(school:SchoolClassList):SchoolClass | undefined{
        return this._classes.find(c => c.id === school)
    }

    public classFinished(school:SchoolClassList){

    }

    private setupClasses():SchoolClass[] {
        let classes: SchoolClass[] = []


        return classes
    }

}