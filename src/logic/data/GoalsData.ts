import { PlayerSave } from "../../model/AccountData";
import { GameServices, GlobalEvents } from "../services";
import { AccountService } from "../services/accounts/AccountService";
import { GameStats, StatsService } from "../services/accounts/StatsService";
import { EventNames, GameFlags } from "../services/Config";
import { IGameService } from "../services/IGameService";
import { FlagService } from "../services/saveData/FlagService";
import { SaveDataService } from "../services/saveData/SaveDataService";

//#region other classes
export interface Goal {
    id: string
    name:string
    flagName: string | undefined
    statName: GameStats | undefined
    operator: Operator
    level: LevelPrice[]
}

export interface LevelPrice{
    targetValue: number
    price: GoalPrice
}

export interface GoalDisplay {
    name:string            
    goal:number
    price:GoalPrice
    currValue:number
}

export interface GoalPrice {
    type: GoalPriceType,
    value: number
}

export enum GoalPriceType {
    incSavingInterest,
    incSavingPeriod,
    lowCreditInterest
}

export enum Operator {
    get,
    let,
    equal,
}

//#endregion

export class GoalsData implements IGameService {
    private _save: SaveDataService;
    private _goalData: Goal[]
    private _player: PlayerSave
    private _event: GlobalEvents
    private _flag: FlagService;
    private _stats: StatsService;

    constructor(save: SaveDataService, stats:StatsService, flag: FlagService, event:GlobalEvents) {
        this._save = save
        this._stats = stats
        this._flag = flag
        this._event = event
        //check save
        if (this._save.getGameSave().player.goals == undefined) {
            this._save.getGameSave().player.goals = {}
        }
        this._player = this._save.getGameSave().player
        this._goalData = this.setupGoals()
        this.cleanAndInitialize()

        this._event.subscribe(EventNames.GoalDone,(caller, price) =>{
            let g = price as LevelPrice
            switch(g.price.type){
                case GoalPriceType.incSavingInterest:
                    GameServices.getService<AccountService>(AccountService.serviceName).addSavingInterestRate(g.price.value)
                    break
                case GoalPriceType.incSavingPeriod:
                    GameServices.getService<AccountService>(AccountService.serviceName).addSavingInterestPeriods(g.price.value)
                    break
                case GoalPriceType.lowCreditInterest:
                    GameServices.getService<AccountService>(AccountService.serviceName).addCreditInterestRate(g.price.value)
                    break
            }
        })
    }
    private static serviceName = 'GoalService'
    getServiceName(): string {
        return GoalsData.serviceName
    }

    public checkIfGoalIsAchived(){
        this._goalData.forEach(g =>{
            let pg = this._player.goals[g.id]
            let cG = g.level[pg]
            if(cG == undefined) return
            let val = this.getGoalValue(g)

            switch(g.operator){
                case Operator.equal:
                    if(val == cG.targetValue){
                        this._player.goals[g.id]++
                        this._event.callEvent(EventNames.GoalDone,this,[g,cG])
                    }
                break
                case Operator.let:
                    if(val <= cG.targetValue){
                        this._player.goals[g.id]++
                        this._event.callEvent(EventNames.GoalDone,this,[g,cG])
                    }
                break    
                case Operator.get:
                    if(val >= cG.targetValue){
                        this._player.goals[g.id]++
                        this._event.callEvent(EventNames.GoalDone,this,[g,cG])
                    }
                break        
            }
        })
    }

    private cleanAndInitialize(){
        this.getGoalIds().forEach(i => {
            if(this._player.goals[i] == undefined){
                this._player.goals[i] = 0
            }
        })
    }

    public getListCurrentGoals():GoalDisplay[]{
        let goalResult:GoalDisplay[] = []
        this._goalData.forEach(g =>{
            let pg = this._player.goals[g.id]
            let eG = g.level[pg]
            if(eG != undefined){
                goalResult.push({
                    name:g.name,
                    currValue:this.getGoalValue(g),
                    goal:eG.targetValue,
                    price:eG.price
                })
            }
            
        })

        return goalResult
    }

    public getGoalValue(g: Goal):number {
        if(g.statName != undefined)
            return this._stats.getStat(g.statName)
        if(g.flagName != undefined)
            return this._flag.getFlagInt(g.flagName)

        return 0
    }

    public getGoalIds(): string[]{
        let ids:string[] = []
        this._goalData.forEach((v,idv)=>{
            ids.push(v.id)
        })

        return ids
    }

    private setupGoals(): Goal[] {
        return [
            {
                statName: GameStats.HighestSavingAccount,
                id: 'hs_1',
                name:'Have in Saving Account',
                operator: Operator.get,
                level: [
                    {
                        price: { type: GoalPriceType.incSavingInterest, value: 0.2 },
                        targetValue: 150000
                    },
                    {
                        price: {type: GoalPriceType.incSavingPeriod, value:400},
                        targetValue: 200000
                    },
                    {
                        price: {type: GoalPriceType.lowCreditInterest, value:0.1},
                        targetValue: 250000
                    },
                    {
                        price: {type: GoalPriceType.lowCreditInterest, value:0.2},
                        targetValue: 300000
                    },
                    {
                        price: {type: GoalPriceType.incSavingInterest, value:0.3},
                        targetValue: 500000
                    },
                    
                ],
                flagName: undefined
            }
        ]
    }
}
