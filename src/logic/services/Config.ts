import { Potential, MarketVolatility } from "../../model/Business"
import { MainSave } from "../../model/MainSave"

export class GameConfig {
    static saveVersion: string = '0.3'
    static getDefaultSave(): MainSave {
        return {
            name: 'unknown',
            lastSave: new Date(),
            ticks: 0,
            business:[],
            marketPotential:Potential.High,
            marketVolatility:MarketVolatility.Medium,
            player:{
                depots:[],
                mainAccount:{balance: 1000, id:'main', interest:0,interestForPeriods:0,isSaving:false,name:'Bank Account'},
                savingAccount:{balance: 100000, id:'saving', interest:3.4, interestForPeriods:900000, name:'Saving Account', isSaving:true},
                taxLog:{}
            },
            flags:{
                tax:GameConfig.tax,
                spread:GameConfig.getBaseSpread,
                t_act:true,
                t_s:0,
                g_tps:GameConfig.singleTimeTick,
                g_gup:GameConfig.gameTickSpeedInMS           
            },
            stats:{
                
            }
        
        }
    }
    
    public static gameChartUpdate: number = 1500
    public static gameTickSpeedInMS:number = 100
    public static businessChartMaxPoints: number = 50
    public static maxLogMessages: number = 100
    public static defaultFloatingPercentage: number = 10
    public static maxPotential: number = 1000
    static CicleHistoryDateFormat: string = 'A_C'
    static AgeHistoryDateFormat: string = 'ageA'
    static businessChangesPotential: number = 995
    static MarketChangePotential: number = 975
    static maxShareStartPrice: number = 25
    static getBaseSpread: number = 1.012
    static marketVolatilityChange: number = 995
    static singleTimeTick: number = 3
    static tax: number = 0.25
    static maxTaxLogs: number = 10
}

export class GameFlags {
    static g_f_taxPercentage: string = 'tax'
    static g_f_shareSpread: string = 'spread'
    static f_i_MarketPotential: string = 'f_mpot'
    static f_i_MarketVolatility: string = 'f_mvol'
    static f_i_BusinessPotential: string = 'f_bpot'
    static t_i_level: string = 't_s'
    static t_b_active: string = 't_act'
    static g_i_gameLoopTickSpeed: string = 'g_gup'
    static g_i_ticksPerLoop: string = 'g_tps'
}

export class EventNames {
    public static periodChange:string = 'periodChange'
    public static circleChange:string = 'circleChange'
    public static ageChange:string = 'ageChange'
    static AddLogMessage: string = 'addLogMessage'
    static selectedBusiness: string = 'selectBusiness'
    static moneyUpdate: string = 'moneyUpdate'
    static showPopup: string = 'showPopup'
}