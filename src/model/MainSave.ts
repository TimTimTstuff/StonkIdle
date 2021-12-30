import { PlayerSave } from './AccountData'
import { Business, MarketVolatility, Potential } from './Business'
export interface MainSave {
    ticks: number
    name: string
    lastSave: Date
    business: Business[]
    player: PlayerSave,
    marketPotential:Potential,
    marketVolatility:MarketVolatility
}
