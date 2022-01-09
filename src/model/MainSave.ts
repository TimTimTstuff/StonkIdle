import { NewsData } from '../logic/services/dataServices/NewsService'
import { PlayerSave } from './AccountData'
import { Business, MarketVolatility, Potential } from './Business'
import { StoreItem } from './StoreItem'
export interface MainSave {
    news: NewsData[]
    ticks: number
    name: string
    lastSave: number
    business: Business[]
    player: PlayerSave,
    marketPotential:Potential,
    marketVolatility:MarketVolatility,
    flags:{[index:string]:string|number|boolean}
    stats:{[index:string]:number}
    store:StoreItem[]
}
