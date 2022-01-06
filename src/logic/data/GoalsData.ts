import { PlayerSave } from "../../model/AccountData";
import { GameCalculator } from "../module/calculator/GameCalculator";
import { GameServices, GlobalEvents, LogService } from "../services";
import { AccountService } from "../services/accounts/AccountService";
import { GameStats, StatsService } from "../services/accounts/StatsService";
import { EventNames, GameFlags } from "../services/Config";
import { IGameService } from "../services/IGameService";
import { FlagService } from "../services/saveData/FlagService";
import { SaveDataService } from "../services/saveData/SaveDataService";

//#region other classes
export interface Goal {
    id: string
    name: string
    flagName: string | undefined
    statName: GameStats | undefined
    operator: Operator
    level: LevelPrice[]
}

export interface LevelPrice {
    targetValue: number
    price: GoalPrice
}

export interface GoalDisplay {
    name: string
    goal: number
    price: GoalPrice
    currValue: number
    percentReached: number,
    level:number,
    maxLevel:number
}

export interface GoalPrice {
    type: GoalPriceType,
    value: number
}

export enum GoalPriceType {
    incSavingInterest,
    incSavingPeriod,
    lowCreditInterest,
    lowShopPrices,
    maxItemInShop,
    chanceForItem
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
    private _log: LogService

    //#region Service
    public static serviceName = 'GoalService'
    getServiceName(): string {
        return GoalsData.serviceName
    }
    //#endregion

    constructor(save: SaveDataService, stats: StatsService, flag: FlagService, event: GlobalEvents, log:LogService) {
        this._save = save
        this._stats = stats
        this._flag = flag
        this._event = event
        this._log = log
        //check save
        if (this._save.getGameSave().player.goals === undefined) {
            this._save.getGameSave().player.goals = {}
        }
        this._player = this._save.getGameSave().player
        this._goalData = this.setupGoals()
        this.cleanAndInitialize()

        this._event.subscribe(EventNames.periodChange, (caller, period)=>{
            this.checkIfGoalIsAchived()
        })

        this._event.subscribe(EventNames.GoalDone, (caller, price) => {
            let g = price as LevelPrice
            switch (g.price.type) {
                case GoalPriceType.incSavingInterest:
                    GameServices.getService<AccountService>(AccountService.serviceName).addSavingInterestRate(g.price.value)
                    this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Goal reached! Get ${g.price.value} to your Saving Interest-rate`,key:'goal'})
                    break
                case GoalPriceType.incSavingPeriod:
                    GameServices.getService<AccountService>(AccountService.serviceName).addSavingInterestPeriods(g.price.value)
                    this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Goal reached! Get ${g.price.value} to your Saving Interest-period`,key:'goal'})
                    break
                case GoalPriceType.lowCreditInterest:
                    GameServices.getService<AccountService>(AccountService.serviceName).removeCreditInterestRate(g.price.value)
                    this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Goal reached! Get ${g.price.value} to your Credit Interest-rate`,key:'goal'})
                    break
                case GoalPriceType.lowShopPrices:
                    this._flag.addToFlag(GameFlags.s_i_discount,g.price.value)
                    this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Goal reached! Get ${g.price.value}% discount on Store Items`,key:'goal'})
                    break
                case GoalPriceType.maxItemInShop:
                    this._flag.addToFlag(GameFlags.s_i_maxItems, g.price.value)
                    this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Goal reached! Get ${g.price.value} more items Slots in the Store`,key:'goal'})
                    break
                case GoalPriceType.chanceForItem:
                    this._flag.addToFlag(GameFlags.s_i_itemChance,GameCalculator.roundValue(g.price.value*10,0))
                    this._event.callEvent(EventNames.AddLogMessage,this,{msg:`Goal reached! Get ${g.price.value}% to Shop Item Chance`,key:'goal'})
                    break
                default:
                    this._log.warn(GoalsData.serviceName,`Cant find Price for ${g.price}`,g)
            }
        })
    }

    public checkIfGoalIsAchived() {
        this._goalData.forEach(g => {
            let pg = this._player.goals[g.id]
            let cG = g.level[pg]
            if (cG === undefined) return
            let val = this.getGoalValue(g)

            switch (g.operator) {
                case Operator.equal:
                    if (val === cG.targetValue) {
                        this._player.goals[g.id]++
                        this._event.callEvent(EventNames.GoalDone, this, cG)
                    }
                    break
                case Operator.let:
                    if (val <= cG.targetValue) {
                        this._player.goals[g.id]++
                        this._event.callEvent(EventNames.GoalDone, this, cG)
                    }
                    break
                case Operator.get:
                    if (val >= cG.targetValue) {
                        this._player.goals[g.id]++
                        this._event.callEvent(EventNames.GoalDone, this, cG)
                    }
                    break
            }
        })
    }

    public getListCurrentGoals(): GoalDisplay[] {
        let goalResult: GoalDisplay[] = []
        this._goalData.forEach(g => {
            let pg = this._player.goals[g.id]
            let eG = g.level[pg]
            if (eG !== undefined) {
                goalResult.push({
                    name: g.name,
                    currValue: this.getGoalValue(g),
                    goal: eG.targetValue,
                    price: eG.price,
                    percentReached: GameCalculator.roundValue(100 / eG.targetValue * this.getGoalValue(g)),
                    level: pg+1,
                    maxLevel: g.level.length
                })
            }

        })

        return goalResult
    }

    public getGoalValue(g: Goal): number {
        if (g.statName !== undefined)
            return this._stats.getStat(g.statName)
        if (g.flagName !== undefined)
            return this._flag.getFlagFloat(g.flagName)

        return 0
    }

    public getGoalIds(): string[] {
        let ids: string[] = []
        this._goalData.forEach((v, idv) => {
            ids.push(v.id)
        })

        return ids
    }

    private setupGoals(): Goal[] {
        return [
            {
                statName: GameStats.HighestSavingAccount,
                id: 'hs_1',
                name: 'Have in Saving Account',
                operator: Operator.get,
                level: [
                    {
                        price: { type: GoalPriceType.incSavingInterest, value: 0.2 },
                        targetValue: 150000
                    },
                    {
                        price: { type: GoalPriceType.incSavingPeriod, value: 400 },
                        targetValue: 200000
                    },
                    {
                        price: { type: GoalPriceType.lowCreditInterest, value: 0.1 },
                        targetValue: 250000
                    },
                    {
                        price: { type: GoalPriceType.lowCreditInterest, value: 0.2 },
                        targetValue: 300000
                    },
                    {
                        price: { type: GoalPriceType.incSavingInterest, value: 0.3 },
                        targetValue: 500000
                    },
                    {
                        price: { type: GoalPriceType.incSavingPeriod, value: 500 },
                        targetValue: 700000
                    },
                    {
                        price: { type: GoalPriceType.incSavingInterest, value: 0.2 },
                        targetValue: 900000
                    },
                    {
                        price: { type: GoalPriceType.incSavingPeriod, value: 500 },
                        targetValue: 1000000
                    },
                    {
                        price: { type: GoalPriceType.incSavingPeriod, value: 1000 },
                        targetValue: 120000
                    },
                    {
                        price: { type: GoalPriceType.incSavingInterest, value: 0.1 },
                        targetValue: 1500000
                    },
                    {
                        price: { type: GoalPriceType.incSavingInterest, value: 0.1 },
                        targetValue: 1750000
                    },
                    {
                        price: { type: GoalPriceType.incSavingInterest, value: 0.3 },
                        targetValue: 2500000
                    },

                ],
                flagName: undefined
            },
            {
                statName:GameStats.InterestAmount,
                id:'hi_1',
                name:'Earn money with Interest',
                operator:Operator.get,
                level:[
                    {
                        targetValue: 10000,
                        price:{
                            type:GoalPriceType.incSavingInterest,
                            value:0.1
                        }
                    },
                    {
                        targetValue: 25000,
                        price:{
                            type:GoalPriceType.incSavingInterest,
                            value:0.2
                        }
                    },
                    {
                        targetValue: 50000,
                        price:{
                            type:GoalPriceType.incSavingInterest,
                            value:0.3
                        }
                    },
                    {
                        targetValue: 75000,
                        price:{
                            type:GoalPriceType.incSavingPeriod,
                            value:300
                        }
                    },
                    {
                        targetValue: 100000,
                        price:{
                            type:GoalPriceType.lowCreditInterest,
                            value:0.4
                        }
                    },
                    {
                        targetValue: 150000,
                        price:{
                            type:GoalPriceType.incSavingInterest,
                            value:0.4
                        }
                    },
                    {
                        targetValue: 200000,
                        price:{
                            type:GoalPriceType.incSavingPeriod,
                            value:1000
                        }
                    },
                    {
                        targetValue: 500000,
                        price:{
                            type:GoalPriceType.incSavingPeriod,
                            value:1000
                        }
                    },
                    {
                        targetValue: 750000,
                        price:{
                            type:GoalPriceType.incSavingInterest,
                            value:0.1
                        }
                    },
                    {
                        targetValue: 1000000,
                        price:{
                            type:GoalPriceType.incSavingPeriod,
                            value:1000
                        }
                    },
                    {
                        targetValue: 1200000,
                        price:{
                            type:GoalPriceType.lowCreditInterest,
                            value:0.1
                        }
                    },
                    {
                        targetValue: 1500000,
                        price:{
                            type:GoalPriceType.lowCreditInterest,
                            value:0.2
                        }
                    }
                ],
                flagName:undefined
            },
            {
                flagName:undefined,
                statName:GameStats.SharesSellAmount,
                id:'sfs_1',
                level:[
                    {targetValue:10000,price:{value:190,type:GoalPriceType.incSavingPeriod}},
                    {targetValue:25000,price:{value:500,type:GoalPriceType.incSavingPeriod}},
                    {targetValue:50000,price:{value:0.1,type:GoalPriceType.incSavingInterest}},
                    {targetValue:75000,price:{value:0.1,type:GoalPriceType.lowCreditInterest}},
                    {targetValue:100000,price:{value:0.2,type:GoalPriceType.incSavingInterest}},
                    {targetValue:250000,price:{value:0.2,type:GoalPriceType.lowCreditInterest}},
                    {targetValue:500000,price:{value:0.3,type:GoalPriceType.incSavingInterest}},
                    {targetValue:750000,price:{value:0.4,type:GoalPriceType.incSavingInterest}},
                    {targetValue:1000000,price:{value:1000,type:GoalPriceType.incSavingPeriod}},
                    {targetValue:1200000,price:{value:1,type:GoalPriceType.lowShopPrices}},
                    {targetValue:1500000,price:{value:2,type:GoalPriceType.chanceForItem}},
                    {targetValue:1700000,price:{value:0.1,type:GoalPriceType.incSavingInterest}},
                    {targetValue:2000000,price:{value:1100,type:GoalPriceType.incSavingPeriod}},
                    {targetValue:2500000,price:{value:3,type:GoalPriceType.lowShopPrices}},
                ],
                name:'Sell the Shares!',
                operator:Operator.get
            },
            {
                statName: GameStats.ItemsAmount,
                flagName:undefined,
                id:'sib_1',
                name:'Buy in the Store',
                operator:Operator.get,
                level:[
                    {targetValue:1000, price:{value:1,type:GoalPriceType.lowShopPrices}},
                    {targetValue:5000, price:{value:1,type:GoalPriceType.maxItemInShop}},
                    {targetValue:10000, price:{value:1,type:GoalPriceType.chanceForItem}},
                    {targetValue:20000, price:{value:2,type:GoalPriceType.lowShopPrices}},
                    {targetValue:50000, price:{value:2,type:GoalPriceType.maxItemInShop}},
                    {targetValue:75000, price:{value:2,type:GoalPriceType.chanceForItem}},
                    {targetValue:100000, price:{value:3,type:GoalPriceType.lowShopPrices}},
                    {targetValue:250000, price:{value:3,type:GoalPriceType.maxItemInShop}},
                    {targetValue:400000, price:{value:2,type:GoalPriceType.lowShopPrices}},
                    {targetValue:700000, price:{value:2,type:GoalPriceType.lowShopPrices}},
                    {targetValue:1000000, price:{value:2,type:GoalPriceType.lowShopPrices}},
                ]
            }
        ]
    }

    private cleanAndInitialize() {
        this.getGoalIds().forEach(i => {
            if (this._player.goals[i] === undefined) {
                this._player.goals[i] = 0
            }
        })
    }
}
