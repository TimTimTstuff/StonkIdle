export class GameConfig {
    public static gameChartUpdate: number = 1500
    public static gameTickSpeedInMS:number = 44
    public static businessChartMaxPoints: number = 200
    public static maxLogMessages: number = 100
    public static defaultFloatingPercentage: number = 10
    public static maxPotential: number = 1000
    static CicleHistoryDateFormat: string = 'A_C'
    static AgeHistoryDateFormat: string = 'ageA'
    static businessChangesPotential: number = 990
    static MarketChangePotential: number = 975
    static maxShareStartPrice: number = 25
    static getBaseSpread: number = 1.012

}

export class EventNames {
    public static periodChange:string = 'periodChange'
    public static circleChange:string = 'circleChange'
    public static ageChange:string = 'ageChange'
    static AddLogMessage: string = 'addLogMessage'
    static selectedBusiness: string = 'selectBusiness'
    static moneyUpdate: string = 'moneyUpdate'
}