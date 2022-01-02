export interface PlayerSave {
    mainAccount:AccountData
    savingAccount:AccountData
    creditAccount:AccountData
    depots:DepotData[]
    taxLog:{[index:string]:Taxlog}
    goals:{[index:string]:number}
}

export interface Taxlog {
    buyItem: number;
    cost: number;
    sellShare:number
    buyShare:number
    interest:number
    totalIncome:number
    time:number
}
export interface AccountData {
    id:string
    name:string
    balance:number
    isSaving:boolean
    interest:number
    interestForPeriods:number
}

export interface DepotData {
    buyIn: number;
    shareName:string
    shareAmount:number
    transactions:Transaction[]
}

export interface Transaction {
    iS:boolean
    sN:string
    sA:number
    sP:number
}

