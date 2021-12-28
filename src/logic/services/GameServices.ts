import { IGameService } from "./IGameService";

/**
 * Global Services 
 * Register different services here
 */
export class GameServices {

    private _services: { [index: string]: IGameService } = {}
    private static _instance: GameServices;

    constructor() {
        if (GameServices._instance !== undefined)
            throw new Error('GamerServices allready instanciated. Use GameService.get()')
        GameServices._instance = this;
    }

    public static get(): GameServices {
        if (GameServices._instance === undefined)
            GameServices._instance = new GameServices();

        return GameServices._instance;
    }

    public registerService(service: IGameService): void {
        this._services[service.getServiceName()] = service;
    }

    public getService<T>(serviceName: string): T {
        if (serviceName in this._services){
         // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
         const service =  <T><unknown>this._services[serviceName];
         return service;
        }
        else
            throw new Error(`Service ${serviceName} no found!`);
    }

    public static registerService(service: IGameService): void {
        GameServices.get().registerService(service);
    }

    public static getService<T extends IGameService>(serviceName:string):T {
        return GameServices.get().getService(serviceName);
    }

}