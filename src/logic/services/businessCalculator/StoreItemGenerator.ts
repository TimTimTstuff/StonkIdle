import { title } from "process";
import { GameServices, LogService } from "..";
import { ItemType, StoreItem } from "../../../model/StoreItem";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { AccountService } from "../accounts/AccountService";
import { GameFlags } from "../Config";
import { FlagService } from "../saveData/FlagService";
import { TimeService } from "../timeService/TimeService";

export enum ItemPriceFactor{
    VeryExpensive = 4,
    Expensive = 8,
    Moderat = 20,
    Cheap = 150,
    VeryCheap = 300,
    
}

export class StoreItemGenerator {
    static itemGenerator_NewsSubscription(): StoreItem {
        let ticksToPeriod = GameCalculator.roundValue((Math.random()*500),0)
        let item: StoreItem = {
            avaliableTicks:Math.floor(Math.random()*5000),
            id: StoreItemGenerator.getRandomId(),
            description:'Get your latest Market news!',
            title: 'News Subscription',
            effect:{
                shortName:'',
                value: ticksToPeriod
            },
            itemType: ItemType.NewsSubscription,
            price: StoreItemGenerator.generateStorePrice(ItemPriceFactor.Moderat)
        }

        return item
    }

    public static itemGenerator_Jackpot():StoreItem{

        let item:StoreItem = {
            avaliableTicks: Math.floor(Math.random()*2500),
            id:StoreItemGenerator.getRandomId(),
            itemType:ItemType.LotteryTicket,
            price:StoreItemGenerator.generateStorePrice(ItemPriceFactor.VeryCheap),
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
    
    public static itemGenerator_PeriodExtension(){
        let ticksToStoreAvaliable = Math.floor(Math.random()*9000)
        let ticksToPeriod = GameCalculator.roundValue((Math.random()*500),0)
        let formatTicks = GameServices.getService<TimeService>(TimeService.serviceName).getFormated('A/C/P',ticksToPeriod*100)
        let id = StoreItemGenerator.getRandomId()
        let item = {
            id:id,
            avaliableTicks:ticksToStoreAvaliable,
            description:`Your periods for your Savings interest get extended by: ${formatTicks}`,
            itemType: ItemType.ChangeInterestRuntime,
            price: StoreItemGenerator.generateStorePrice(ItemPriceFactor.Expensive),
            title: 'Interest period extension',
            effect:{
                value:ticksToPeriod,
                shortName:''
            }

        }
        GameServices.getService<LogService>(LogService.serviceName).debug('StoreItemGenerator',`New Item Generated: ${id}`,item)
        return item
    }

    private static generateStorePrice(priceFactor:ItemPriceFactor): number {
        let discount = GameServices.getService<FlagService>(FlagService.serviceName).getFlagFloat(GameFlags.s_i_discount)

        let price = GameCalculator.roundValue(Math.random()*(StoreItemGenerator.getSavingAccountAmount()/priceFactor))
        if(discount > 0){
            let d = price / 100 * discount
            price = price - d
        }
        return GameCalculator.roundValue(price)
    }

    private static getRandomId() {
        return GameServices.getService<TimeService>(TimeService.serviceName).getFormated('ID_A_C_P_T', Math.round(Math.random() * 10000000));
    }

    private static getSavingAccountAmount():number{
        return GameServices.getService<AccountService>(AccountService.serviceName).getSavingBalance()
    }
}

