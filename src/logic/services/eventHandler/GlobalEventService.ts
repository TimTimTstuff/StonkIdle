import { EventHandler } from "../../module/eventHandler/EventHandler";
import { IGameService } from "../IGameService";

export class GlobalEvents extends EventHandler implements IGameService {
    public static serviceName = 'global-events';
    public  getServiceName():string{
        return GlobalEvents.serviceName;
    }

}