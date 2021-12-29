export interface PlayerSave {
    mainAccount:AccountData
    savingAccount:AccountData
    depots:DepotData[]
    
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
    isSell:boolean
    shareName:string
    shareAmount:number
    moneyAmount:number
}

