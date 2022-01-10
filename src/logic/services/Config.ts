import { Potential, MarketVolatility } from "../../model/Business"
import { MainSave } from "../../model/MainSave"
export class GameConfig {    
    //Don't forget to update
    static lastGameUpdate: string = '10.01.2022'
    static saveVersion: string = '0.6.1'

    static storeItemChance: number = 250
    static storeMaxItems: number = 5
    public static gameChartUpdate: number = 1500
    public static gameTickSpeedInMS:number = 200
    public static businessChartMaxPoints: number = 50
    public static maxLogMessages: number = 100
    public static defaultFloatingPercentage: number = 10
    public static maxPotential: number = 1000
    static CicleHistoryDateFormat: string = 'A_C'
    static AgeHistoryDateFormat: string = 'ageA'
    static businessChangesPotential: number = 995
    static MarketChangePotential: number = 975
    static maxShareStartPrice: number = 25
    static getBaseSpread: number = 12
    static marketVolatilityChange: number = 995
    static singleTimeTick: number = 2
    static tax: number = 25
    static maxTaxLogs: number = 10 
    static maxSavingAsCreditPercentage: number = 25
    static maxNews: number = 10
    static initComp = [
        {n: "World Idle Platform", s: "WIP"},
        {n: "Little Lama Loft", s:'LOL'},
        {n: "Ultra Waifu United", s:'UWU'},
    ]
    
    static demoName = [
        {n: "Alter Reconstruction", s:'ARE'},
        {n: "Riddle with me", s:'RWM'},
        {n: "Nerd Errors Games", s:'NEG'},
        {n: "Dkpure Exports", s:'DEX'},
        {n: "Air fleet Kings", s:'AFK'},
        {n: 'Power Organization Peng', s:'POP'},
    ]

    static getDefaultSave(): MainSave {
        return {
            name: 'unknown',
            lastSave: new Date().getTime(),
            ticks: 0,
            business:[],
            marketPotential:Potential.High,
            marketVolatility:MarketVolatility.Medium,
            player:{
                depots:[],
                mainAccount:{balance: 1000, id:'main', interest:0,interestForPeriods:0,isSaving:false,name:'Bank Account'},
                savingAccount:{balance: 100000, id:'saving', interest:2.4, interestForPeriods:200, name:'Saving Account', isSaving:true},
                creditAccount:{balance: 0, id:'credit',interest:9.8, interestForPeriods:101, name:'Credit Account', isSaving:true},
                taxLog:{},
                goals:{},
                currentSchool:undefined,
                schools:[]
            },
            news:[],
            flags:{
                tax:GameConfig.tax,
                spread:GameConfig.getBaseSpread,
                t_act:true,
                t_s:0,
                g_tps:GameConfig.singleTimeTick,
                g_gup:GameConfig.gameTickSpeedInMS,
                s_ic:GameConfig.storeItemChance,
                s_mi:GameConfig.storeMaxItems,
                s_di:0,
                l_h:'',
                n_a:0,
                o_m:0,         
                o_d:0,
                o_h:0
            },
            stats:{
                
            },
            store:[]
        
        }
    }
}


export class GameFlags {
    static g_f_taxPercentage: string = 'tax'//store tax amount
    static g_f_shareSpread: string = 'spread'//store share spread buy/sell
    static t_i_level: string = 't_s'//Tutorial Level
    static t_b_active: string = 't_act'//Tutorial active
    static g_i_gameLoopTickSpeed: string = 'g_gup'//IntervallTickSpeed
    static g_i_ticksPerLoop: string = 'g_tps'//Ticks per Loop
    static s_i_itemChance: string = 's_ic'//Chance find item in shop
    static s_i_maxItems: string = 's_mi' //max items in the shop
    static s_i_discount: string ='s_di' //discound on shop items
    static l_s_hide: string = 'l_h'//GameLog Filter records
    static n_n_AbonementTime: string = 'n_a'//news subscription time
    static sw_s_lastTab: string = 's_lt'//last opend tab in the store window
    static o_i_minutes: string = 'o_m'//offline minutes
    static o_i_days: string = 'o_d'//offline days
    static o_i_hours: string = 'o_h'//offline hours
}
export class EventNames {
    public static periodChange:string = 'periodChange'
    public static circleChange:string = 'circleChange'
    public static ageChange:string = 'ageChange'
    static AddLogMessage: string = 'addLogMessage'
    static selectedBusiness: string = 'selectBusiness'
    static moneyUpdate: string = 'moneyUpdate'
    static showPopup: string = 'showPopup'
    static openTransfereWindow: string ='openTransfereWindow'
    static GoalDone: string = 'goalDone'
    static newNews: string = 'newNews'
    static ShowGameOverlay: string = 'showOverlay'
}