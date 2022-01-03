import { title } from "process";
import { GameServices, LogService } from "..";
import { ItemType, StoreItem } from "../../../model/StoreItem";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { AccountService } from "../accounts/AccountService";
import { TimeService } from "../timeService/TimeService";

export class StoreItemGenerator {


    private static getSavingAccountAmount():number{
        return GameServices.getService<AccountService>(AccountService.serviceName).getSavingBalance()
    }

    public static generateJackpot():StoreItem{

        let item:StoreItem = {
            avaliableTicks: Math.floor(Math.random()*2500),
            id:StoreItemGenerator.getRandomId(),
            itemType:ItemType.LotteryTicket,
            price:GameCalculator.roundValue(Math.random()*(StoreItemGenerator.getSavingAccountAmount()/200)),
            effect:{
                value:GameCalculator.roundValue(Math.random()*(StoreItemGenerator.getSavingAccountAmount()/10)),
                shortName:''
            },
            description:'Draw a ticket for a price',
            title:'JackPot!'

        }
        GameServices.getService<LogService>(LogService.serviceName).debug('StoreItemGenerator',`New Item Generated: ${item.id}`,item)
        return item
    }

    public static generateInterestPeriodExtension(){
        let ticksToStoreAvaliable = Math.floor(Math.random()*9000)
        let ticksToPeriod = GameCalculator.roundValue((Math.random()*500),0)
        let formatTicks = GameServices.getService<TimeService>(TimeService.serviceName).getFormated('A/C/P',ticksToPeriod*100)
        let id = StoreItemGenerator.getRandomId()
        let item = {
            id:id,
            avaliableTicks:ticksToStoreAvaliable,
            description:`Your periods for your Savings interest get extended by: ${formatTicks}`,
            itemType: ItemType.ChangeInterestRuntime,
            price: GameCalculator.roundValue(Math.random()*(StoreItemGenerator.getSavingAccountAmount()/4),0),
            title: 'Interest period extension',
            effect:{
                value:ticksToPeriod,
                shortName:''
            }

        }
        GameServices.getService<LogService>(LogService.serviceName).debug('StoreItemGenerator',`New Item Generated: ${id}`,item)
        return item
    }

    public static getRandomId() {
        return GameServices.getService<TimeService>(TimeService.serviceName).getFormated('ID_A_C_P_T', Math.round(Math.random() * 10000000));
    }
}

