export interface StoreItem{
    title:string
    price:number
    description:string
    itemType:ItemType
    avaliableTicks:number
    effect:ItemEffect
    id:string
}

export enum ItemType{
    NewSavingsContract,
    ChangeInterestRuntime,
    ChangeInterestRate,
    ChangeTickSpeed,
    PushBusiness,
    PushMarket,
    Learn,

}

export interface ItemEffect {
    shortName:string
    value:number

}