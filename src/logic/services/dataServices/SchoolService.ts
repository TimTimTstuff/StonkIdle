import { GlobalEvents } from "..";
import { EventNames, GameConfig } from "../Config";
import { GS } from "../GS";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";

export enum SchoolClassList {
    MarketPotential = 1,
    MarketVolatility = 2,
    DepotTotalValue = 3,
    BusinessPerformance = 4,
    BusinessAdditionalContent = 5,
    BusinessHistoricalData = 6,
    StoreSeeTab1 = 7,
    StoreSeeNumbers = 8,
    StoreSeeStoreTab = 9,
    AddBusiness5 = 10,
    AddBusiness4 = 11,
    AddBusiness3 = 12,
    AddBusiness2 = 13,
    AddBusiness1 = 14,
    AddBusiness6
}

export interface SchoolClass {
    id:SchoolClassList,
    periodsToFinish:number,
    pricePerPeriod:number,
    title:string,
    description:string
    minOther:number
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
            if(!GS.getAccountService().hasMainAmount(cClass.pricePerPeriod)){
                this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Not enough fundings to pay for School!`, key:'warn'})
                return
            }
            savedShool.p += 1
            GS.getAccountService().removeMainAccount(cClass.pricePerPeriod,'School Fee',true,true)
            GS.getAccountService().addToTaxLogBuyItem(cClass.pricePerPeriod)
            if(savedShool.p >= cClass.periodsToFinish){
                this.processClass(cClass)
                this._event.callEvent(EventNames.AddLogMessage,this,{msg:`You finished Shool!`, key:'goal'})
                this.stopSchool()
            }
            
        })
    }

    public  getAvaliableClasses():SchoolClass[] {
        let finSchool = this._save.getGameSave().player.schools
        return this._classes.filter(c => c.minOther <= finSchool.length && finSchool.indexOf(c.id) === -1)
    }
    public getCurrentClass() {
        return this._save.getGameSave().player.currentSchool
    }
    public processClass(cClass: SchoolClass) {
       this._save.getGameSave().player.schools.push(cClass.id)
       switch(cClass.id){
            case SchoolClassList.AddBusiness1:
                GS.getBusinessCalculator().addBusiness(GameConfig.demoName[0])    
            break;
            case SchoolClassList.AddBusiness2:
                GS.getBusinessCalculator().addBusiness(GameConfig.demoName[1])    
            break;
            case SchoolClassList.AddBusiness3:
                GS.getBusinessCalculator().addBusiness(GameConfig.demoName[2])    
            break;
            case SchoolClassList.AddBusiness4:
                GS.getBusinessCalculator().addBusiness(GameConfig.demoName[3])    
            break;
            case SchoolClassList.AddBusiness5:
                GS.getBusinessCalculator().addBusiness(GameConfig.demoName[4])    
            break;
            case SchoolClassList.AddBusiness6:
                GS.getBusinessCalculator().addBusiness(GameConfig.demoName[5])    
            break;
       }
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
        return this._save.getGameSave().player.schools.indexOf(school) > -1
    }

    private setupClasses():SchoolClass[] {
        let classes: SchoolClass[] = []

        classes.push({
            id:SchoolClassList.AddBusiness1,
            title:'Whats in the Market 1',
            description:'You discover another Bussines to invest in!',
            periodsToFinish:10,
            pricePerPeriod:10,
            minOther:1
        })

        classes.push({
            id:SchoolClassList.AddBusiness2,
            title:'Whats in the Market 2',
            description:'You discover another Bussines to invest in!',
            periodsToFinish:25,
            pricePerPeriod:20,
            minOther:5
        })

        classes.push({
            id:SchoolClassList.AddBusiness3,
            title:'Whats in the Market 3',
            description:'You discover another Bussines to invest in!',
            periodsToFinish:50,
            pricePerPeriod:30,
            minOther:7
        })

        classes.push({
            id:SchoolClassList.AddBusiness4,
            title:'Whats in the Market 4',
            description:'You discover another Bussines to invest in!',
            periodsToFinish:100,
            pricePerPeriod:40,
            minOther:8
        })

        classes.push({
            id:SchoolClassList.AddBusiness5,
            title:'Whats in the Market 5',
            description:'You discover another Bussines to invest in!',
            periodsToFinish:200,
            pricePerPeriod:50,
            minOther:9
        })

        classes.push({
            id:SchoolClassList.AddBusiness6,
            title:'Whats in the Market 6',
            description:'You discover another Bussines to invest in!',
            periodsToFinish:400,
            pricePerPeriod:60,
            minOther:10
        })

        classes.push({
            id:SchoolClassList.DepotTotalValue,
            title:'What is it wroth?',
            description:'You learn to calculate the whole Portfolio value',
            periodsToFinish:35,
            pricePerPeriod:18,
            minOther:1
        })

        classes.push({
            id:SchoolClassList.StoreSeeStoreTab,
            title:'A Shop',
            description:'You get access to the Shop!',
            periodsToFinish:10,
            pricePerPeriod:12,
            minOther:0
        })

        classes.push({
            id:SchoolClassList.StoreSeeTab1,
            title:'Where the Money goes',
            description:'You get access to your balance sheet!',
            periodsToFinish:16,
            pricePerPeriod:13,
            minOther:0
        })

        classes.push({
            id:SchoolClassList.StoreSeeNumbers,
            title:'More numbers for your life!',
            description:'You get access to additional Numbers',
            periodsToFinish:90,
            pricePerPeriod:25,
            minOther:3
        })

        classes.push({
            id:SchoolClassList.BusinessHistoricalData,
            title:'What was in the Past',
            description:'Get additional historical information about the Stock!',
            periodsToFinish:50,
            pricePerPeriod:15,
            minOther:3
        })

        classes.push({
            id:SchoolClassList.BusinessAdditionalContent,
            title:'More knowledge about the Stonk!',
            description:'You learn more information about your Depot',
            periodsToFinish:35,
            pricePerPeriod:100,
            minOther:2
        })

        classes.push({
            id:SchoolClassList.BusinessPerformance,
            title:'Where are they going?',
            description:'Learn how to read to Performance of the Business to determine the Chart',
            periodsToFinish:100,
            pricePerPeriod:54,
            minOther:2
        })

        classes.push({
            id:SchoolClassList.MarketPotential,
            title:'Understand the Market',
            description:'You understand the Performance of the whole Market',
            periodsToFinish:200,
            pricePerPeriod:150,
            minOther:5
        })

        classes.push({
            id:SchoolClassList.MarketVolatility,
            title:'Understand the Market Movement',
            description:'You learn to know how the Market volatility is!',
            periodsToFinish:200,
            pricePerPeriod:250,
            minOther:5
        })

        return classes
    }

}