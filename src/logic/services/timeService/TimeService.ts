import { GameServices } from "..";
import { IGameService } from "../IGameService";
import { SaveDataService } from "../saveData/SaveDataService";

/**
 * Ticks: 100
 * Period: 100
 * Circle: 100
 * 
 */
export class TimeService implements IGameService {
    
    public static serviceName = 'TimeService'

    public static readonly age: number = 100 * 100 * 100;
    public static readonly circle: number = 100 * 100;
    public static readonly period: number = 100;

    private _saveData: SaveDataService;
    private static _in: TimeService;
    /**
     *
     */
    constructor() {
        this._saveData = GameServices.getService<SaveDataService>(SaveDataService.serviceName);
        if(TimeService._in !== undefined){
            throw new Error('Double TimeService!')
        }
        TimeService._in = this;
    }

    public static getInstance(){
        if(TimeService._in !== undefined){
            return TimeService._in
        }
        return new TimeService()
    }

    getServiceName(): string {
        return TimeService.serviceName
    }

    addTimeTick(): void {
        this.addTicks(1);
    }

    getTicks(): number {
        return this._saveData.getGameSave().ticks;
    }

    addTicks(ticks: number) {
        this._saveData.getGameSave().ticks += ticks;
    }

    getCurrentTimeBox(): TimeBox{
        return this.getTimeBox(this.getTicks())
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

        if (box.ticks >= TimeService.circle) {
            box.circle = Math.floor(box.ticks / TimeService.circle);
            box.ticks -= box.circle * TimeService.circle;
        }

        if (box.ticks >= TimeService.period) {
            box.period = Math.floor(box.ticks / TimeService.period);
            box.ticks -= box.period * TimeService.period;
        }

        return box;
    }

    getCurrentTimeFormated(): string {
        return this.getFormated("A-C-P (T)", this.getTicks());
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
