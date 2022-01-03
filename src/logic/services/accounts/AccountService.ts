import { GlobalEvents } from "..";
import { Taxlog } from "../../../model/AccountData";
import { GameCalculator } from "../../module/calculator/GameCalculator";
import { EventNames, GameConfig, GameFlags } from "../Config";
import { IGameService } from "../IGameService";
import { FlagService } from "../saveData/FlagService";
import { SaveDataService } from "../saveData/SaveDataService";
import { TimeService } from "../timeService/TimeService";
import { GameStats, GameStatsMethod, StatsService } from "./StatsService";

export class AccountService implements IGameService {
    

    //#region Service
    public static serviceName = 'Account'
    public getServiceName(): string {
        return AccountService.serviceName
    }
    //#endregion

    //#region fields /ctor
    private _saveService: SaveDataService
    private _event: GlobalEvents;
    private _time: TimeService;
    private _flag: FlagService;
    private _stats: StatsService;

    constructor(saveService: SaveDataService, event: GlobalEvents, time: TimeService, flag: FlagService, stats: StatsService) {
        this._saveService = saveService
        this._event = event
        this._time = time
        this._flag = flag
        this._stats = stats
    }
    //#endregion

    //#region taxes
    public getLastTaxInfo(count: number) {
        let taxInfo = []
        let log = this._saveService.getGameSave().player.taxLog
        let tLogKey = Object.keys(log)
        if (tLogKey.length < count) count = tLogKey.length
        for (let i = 1; i <= count; i++) {
            taxInfo.push(log[tLogKey[tLogKey.length - (i)]])
        }

        return taxInfo
    }

    public addToTaxLogInterest(amount: number) {
        let sk = this.getCurrentTaxLog();
        sk.interest += amount
        this.recalculateTax(sk)
    }

    public addToTaxLogBuyStock(amount: number) {
        let sk = this.getCurrentTaxLog()
        sk.buyShare += amount
        this.recalculateTax(sk)
    }

    public addToTaxLogSellStock(amount: number) {
        let sk = this.getCurrentTaxLog()
        sk.sellShare += amount
        this.recalculateTax(sk)
    }

    public addToTaxLogBuyItem(amount: number) {
        let sk = this.getCurrentTaxLog()
        sk.buyItem += amount
        this.recalculateTax(sk)
    }

    private recalculateTax(log: Taxlog) {
        log.totalIncome = GameCalculator.roundValue((log.sellShare + log.interest) - (log.buyShare + log.buyItem))
        log.cost = GameCalculator.roundValue((log.totalIncome * this._flag.getFlagFloat(GameFlags.g_f_taxPercentage)) * -1)
    }

    private getCurrentTaxLog() {
        let save = this._saveService.getGameSave().player;
        let saveKey = this._time.getFormated('A_C', this._time.getTicks());
        if (save.taxLog[saveKey] == undefined) {
            save.taxLog[saveKey] = { buyShare: 0, sellShare: 0, interest: 0, totalIncome: 0, time: this._time.getTicks(), cost: 0, buyItem: 0 };
            let keys = Object.keys(save.taxLog)
            if (keys.length > GameConfig.maxTaxLogs) {
                delete save.taxLog[keys[0]]
            }

        }
        return save.taxLog[saveKey];
    }

    private getPreviouseTaxLog() {
        let saveKey = this._time.getFormated('A_C', this._time.getTicks() - 1000)
        return this._saveService.getGameSave().player.taxLog[saveKey]
    }
    //#endregion

    //#region Game Updates
    public onPeriodUpdate() {
        let savingAccount = this._saveService.getGameSave().player.savingAccount
        if (savingAccount.interestForPeriods > 0) {
            savingAccount.interestForPeriods--
            let interest = GameCalculator.roundValue((savingAccount.interest / 100 / 100) * savingAccount.balance)
            this.addToTaxLogInterest(interest)
            this.addMainAccount(interest, 'interest income', true)
            this._stats.setStat(GameStats.Interest, interest, GameStatsMethod.Add)
        }

        let creditAccount = this._saveService.getGameSave().player.creditAccount
        if (creditAccount.interestForPeriods > 0) {
            creditAccount.interestForPeriods--
            let interest = GameCalculator.roundValue((creditAccount.interest / 100 / 100) * creditAccount.balance)
            this.addToTaxLogInterest(interest)
            this.removeMainAccount(interest * -1, 'interest payment', true)
            this._stats.setStat(GameStats.Interest, interest, GameStatsMethod.Add)
        }
    }

    public onCicleUpdate() {
        let tax = this.getPreviouseTaxLog()
        this.addCreditInterestPeriods(101)
        if (tax.cost > 0) {
            this.addMainAccount(tax.cost, 'Tax Return')
        } else {
            this.removeMainAccount(tax.cost * -1, 'Pay Taxes', true)
        }

    }
    //#endregion

    //#region transfere methods
    public transfereMainToSaving(amount: number): boolean {
        if (!this.hasMainAmount(amount)) {
            return false
        }

        return this.addSavingAccount(this.removeMainAccount(amount) ? amount : 0)
    }

    public transfereCreditToMain(amount: number): boolean {
        if (!this.hasCreditAmount(amount)) {
            return false
        }

        return this.addMainAccount(this.removeCreditAccount(amount) ? amount : 0)
    }

    public transfereSavingToMain(amount: number): boolean {
        if (!this.hasSavingsAmount(amount)) {
            return false
        }

        return this.addMainAccount(this.removeSavingAccount(amount) ? amount : 0)
    }

    public transfereMainToCredit(amount: number): boolean {
        if (!this.hasMainAmount(amount)) {
            return false
        }

        return this.addCreditAmount(this.removeMainAccount(amount) ? amount : 0)
    }
    //#endregion

    //#region Main Account
    public hasMainAmount(amount: number): boolean {
        return this._saveService.getGameSave().player.mainAccount.balance > amount
    }

    public getMainAccountBalance(): number {
        return this._saveService.getGameSave().player.mainAccount.balance
    }

    public removeMainAccount(amount: number, reason?: string, canMinus: boolean = false, notify: boolean = true): boolean {
        if (amount < 0) return false
        if (this._saveService.getGameSave().player.mainAccount.balance < amount && !canMinus) {
            return false
        }
        this._saveService.getGameSave().player.mainAccount.balance -= amount
        if (notify) {
            this._event.callEvent(EventNames.AddLogMessage, this, { msg: `Main: -${amount}€ ${reason !== undefined ? `Reason: ${reason}` : ''}`, key: 'out' })
        }
        this._event.callEvent(EventNames.moneyUpdate, this, { i: false, a: amount })
        return true
    }

    public addMainAccount(amount: number, reason?: string, notify: boolean = true): boolean {
        this._saveService.getGameSave().player.mainAccount.balance += amount
        if (notify) {
            this._event.callEvent(EventNames.AddLogMessage, this, { msg: `Main: ${amount}€ ${reason !== undefined ? `Reason: ${reason}` : ''}`, key: 'income' })
        }
        this._event.callEvent(EventNames.moneyUpdate, this, { i: true, a: amount })
        this._stats.setStat(GameStats.HighestMainAccount, this.getMainAccountBalance(), GameStatsMethod.OverwriteIfHigher)
        return true
    }
    //#endregion

    //#region credit account
   
    addCreditInterestRate(value: number) {
        this._saveService.getGameSave().player.creditAccount.interest += value
    }

    removeCreditInterestRate(value: number) {
        this._saveService.getGameSave().player.creditAccount.interest -= value
    }
    public getCreditBalance(): number {
        return this._saveService.getGameSave().player.creditAccount.balance
    }

    public creditAccountMaxCredit(): number {
        let c = (this.getSavingBalance()) / 100 * GameConfig.maxSavingAsCreditPercentage
        return Math.floor(c * -1)
    }

    public creditAccountLeft(): number {
        return Math.floor(this.getCreditBalance() - this.creditAccountMaxCredit())
    }

    public hasCreditAmount(amount: number): boolean {
        return (this.getCreditBalance() - amount) >= this.creditAccountMaxCredit()
    }

    public removeCreditAccount(amount: number, reason?: string): boolean {

        if (!this.hasCreditAmount(amount)) {
            return false
        }
        this._saveService.getGameSave().player.creditAccount.balance -= amount
        this._event.callEvent(EventNames.AddLogMessage, this, { msg: `Credit: -${amount}€ ${reason !== undefined ? `Reason: ${reason}` : ''}`, key: 'out' })
        this._event.callEvent(EventNames.moneyUpdate, this, { i: false, a: amount })
        return true

    }

    public getCreditInterest(): number {
        return this._saveService.getGameSave().player.creditAccount.interest
    }

    public getCreditInterestLeft(): number {
        return this._saveService.getGameSave().player.creditAccount.interestForPeriods
    }
    public addCreditInterestPeriods(value: number) {
        this._saveService.getGameSave().player.creditAccount.interestForPeriods += value
    }
    public addCreditAmount(amount: number, reason?: string, notify: boolean = true): boolean {

        if (this._saveService.getGameSave().player.creditAccount.balance > 0) return false

        this._saveService.getGameSave().player.creditAccount.balance += amount
        if (notify) {
            this._event.callEvent(EventNames.AddLogMessage, this, { msg: `Credit: ${amount}€ ${reason !== undefined ? `Reason: ${reason}` : ''}`, key: 'income' })
        }
        this._event.callEvent(EventNames.moneyUpdate, this, { i: false, a: amount })
        return true
    }

    //#endregion

    //#region Saving Account
    addSavingInterestRate(value: number) {
        this._saveService.getGameSave().player.savingAccount.interest += value
    }
    public addSavingInterestPeriods(value: number) {
        this._saveService.getGameSave().player.savingAccount.interestForPeriods += value
    }
    public hasSavingsAmount(amount: number): boolean {
        return this._saveService.getGameSave().player.savingAccount.balance > amount
    }

    public getSavingInterest(): number {
        return this._saveService.getGameSave().player.savingAccount.interest
    }

    public getSavingInterestLeft(): number {
        return this._saveService.getGameSave().player.savingAccount.interestForPeriods
    }

    public getSavingBalance(): number {
        return this._saveService.getGameSave().player.savingAccount.balance
    }

    public removeSavingAccount(amount: number, reason?: string): boolean {
        if (amount < 0) return false
        if (this._saveService.getGameSave().player.savingAccount.balance < amount) {
            return false
        }
        this._saveService.getGameSave().player.savingAccount.balance -= amount
        this._event.callEvent(EventNames.AddLogMessage, this, { msg: `Savings: -${amount}€ ${reason !== undefined ? `Reason: ${reason}` : ''}`, key: 'out' })
        this._event.callEvent(EventNames.moneyUpdate, this, { i: false, a: amount })
        return true
    }

    public addSavingAccount(amount: number, reason?: string): boolean {
        this._saveService.getGameSave().player.savingAccount.balance += amount
        this._event.callEvent(EventNames.AddLogMessage, this, { msg: `Savings: ${amount}€ ${reason !== undefined ? `Reason: ${reason}` : ''}`, key: 'income' })
        this._event.callEvent(EventNames.moneyUpdate, this, { i: true, a: amount })
        this._stats.setStat(GameStats.HighestSavingAccount, this.getSavingBalance(), GameStatsMethod.OverwriteIfHigher)
        return true
    }
    //#endregion

}