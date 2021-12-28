export class GameConfig {
    public static gameChartUpdate: number = 1500
    public static gameTickSpeedInMS:number = 50
    public static businessChartMaxPoints: number = 20
    public static maxLogMessages: number = 100
}

export class EventNames {
    public static periodChange:string = 'periodChange'
    public static circleChange:string = 'circleChange'
    public static ageChange:string = 'ageChange'
    static AddLogMessage: string = 'addLogMessage'
}