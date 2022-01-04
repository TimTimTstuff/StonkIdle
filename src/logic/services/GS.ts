import { GameServices, GlobalEvents, LogService } from ".";
import { GoalsData } from "../data/GoalsData";
import { AccountService } from "./accounts/AccountService";
import { DepotService } from "./accounts/DepotService";
import { StatsService } from "./accounts/StatsService";
import { BusinessCalculator } from "./businessCalculator/BusinessCalculator";
import { StoreManager } from "./businessCalculator/StoreManager";
import { InfoData } from "./dataServices/InfoData";
import { FlagService } from "./saveData/FlagService";
import { SaveDataService } from "./saveData/SaveDataService";
import { TimeService } from "./timeService/TimeService";

export class GS extends GameServices{

    public static getAccountService():AccountService{
        return this.getService(AccountService.serviceName)
    }

    public static getLogService():LogService{
        return this.getService(LogService.serviceName)
    }

    public static getSaveDataService():SaveDataService{
        return this.getService(SaveDataService.serviceName)
    }

    public static getGlobalEvents():GlobalEvents{
        return this.getService(GlobalEvents.serviceName)
    }

    public static getFlagService():FlagService{
        return this.getService(FlagService.serviceName)
    }

    public static getTimeService():TimeService{
        return this.getService(TimeService.serviceName)
    }

    public static getStatsService():StatsService{
        return this.getService(StatsService.serviceName)
    }

    public static getBusinessCalculator():BusinessCalculator{
        return this.getService(BusinessCalculator.serviceName)
    }
    public static getDepotService():DepotService{
        return this.getService(DepotService.serviceName)
    }
    public static getStoreManager():StoreManager{
        return this.getService(StoreManager.serviceName)
    }
    public static getGoalsData():GoalsData{
        return this.getService(GoalsData.serviceName)
    }

    public static getInfoData():InfoData{
        return this.getService(InfoData.serviceName)
    }
}