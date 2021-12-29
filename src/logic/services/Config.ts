export class GameConfig {
    public static gameChartUpdate: number = 1500
    public static gameTickSpeedInMS:number = 250
    public static businessChartMaxPoints: number = 55
    public static maxLogMessages: number = 100
    public static defaultFloatingPercentage: number = 10
    public static maxPotential: number = 1000

}

export class EventNames {
    public static periodChange:string = 'periodChange'
    public static circleChange:string = 'circleChange'
    public static ageChange:string = 'ageChange'
    static AddLogMessage: string = 'addLogMessage'
    static selectedBusiness: string = 'selectBusiness'
}