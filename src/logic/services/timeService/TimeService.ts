import { GameServices, GlobalEvents } from '..'
import { EventNames, GameFlags } from '../Config'
import { IGameService } from '../IGameService'
import { FlagService } from '../saveData/FlagService'
import { SaveDataService } from '../saveData/SaveDataService'
export class TimeService implements IGameService {
    
    
    public static serviceName = 'TimeService'

    public static readonly age: number = 100 * 100 * 100
    public static readonly circle: number = 100 * 100
    public static readonly period: number = 100

    private _saveData: SaveDataService
    private static _in: TimeService
    private _lastTb: TimeBox
    private _flagService: FlagService

    constructor(flag:FlagService, save:SaveDataService) {
        this._saveData = save
        if(TimeService._in !== undefined){
            throw new Error('Recreate TimeService!')
        }
        this._flagService = flag
        TimeService._in = this
        this._lastTb = this.getCurrentTimeBox()

    }

    public static getInstance(flag:FlagService, save:SaveDataService){
        if(TimeService._in !== undefined){
            return TimeService._in
        }
        return new TimeService(flag, save)
    }

    getServiceName(): string {
        return TimeService.serviceName
    }

    addTimeTick(): void {
        this.addTicks(this._flagService.getFlagInt(GameFlags.g_i_ticksPerLoop));
    }

    getTicks(): number {
        return this._saveData.getGameSave().ticks;
    }

    addTicks(ticks: number) {
        this._saveData.getGameSave().ticks += ticks;
        this.calculatePeriodChange()
    }

    private calculatePeriodChange() {
        let newTb = this.getCurrentTimeBox()
        if (newTb.period > this._lastTb.period) {
            GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.periodChange, this, { o: this._lastTb.period, n: newTb.period })
        }
        if (newTb.circle > this._lastTb.circle) {
            GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.circleChange, this, { o: this._lastTb.period, n: newTb.period })
        }
        if (newTb.age > this._lastTb.age) {
            GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent(EventNames.ageChange, this, { o: this._lastTb.period, n: newTb.period })
        }

        this._lastTb = newTb
    }

    getCurrentTimeBox(): TimeBox{
        return this.getTimeBox(this.getTicks())
    }

    getCurrentAge() {
        return this.getTimeBox(this.getTicks()).age
    }

    
    getCurrentCicle() {
        return this.getTimeBox(this.getTicks()).circle
    }

    getTimeBox(ticks: number): TimeBox {
        let box: TimeBox = {
            totalTicks: ticks,
            ticks: ticks,
            age: 0,
            circle: 0,
            period: 0
        }

        //calculate ages
        if (box.ticks >= TimeService.age) {
            box.age = Math.floor(box.ticks / TimeService.age);
            box.ticks -= TimeService.age * box.age;
        }
        //calculate circles
        if (box.ticks >= TimeService.circle) {
            box.circle = Math.floor(box.ticks / TimeService.circle);
            box.ticks -= box.circle * TimeService.circle;
        }
        //calculate periods
        if (box.ticks >= TimeService.period) {
            box.period = Math.floor(box.ticks / TimeService.period);
            box.ticks -= box.period * TimeService.period;
        }

        return box;
    }

    getCurrentTimeFormated(): string {
        return this.getFormated('A-C-P (T)', this.getTicks());
    }

    getFormated(format: string, time: number | TimeBox): string {
        if (typeof time === 'number') {
            time = this.getTimeBox(time)
        }

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        let box = <TimeBox>time;
        format = format.replace('T', box.ticks.toString())
        format = format.replace('P', box.period.toString())
        format = format.replace('C', box.circle.toString())
        format = format.replace('A', box.age.toString())

        return format;
    }
    
}

export interface TimeBox {
    age: number
    circle: number
    period: number
    ticks: number
    totalTicks: number
}
