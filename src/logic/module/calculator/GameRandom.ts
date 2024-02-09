export class GameRandom {

    public static GetRandom(min:number, max:number, precision:number = 0){
        let value = (Math.random()*max)+min
        let prec = 1
        for(let i = 0; i < precision; i++){
            prec *= 10
        }

        return Math.round(value*prec)/prec
    }

    public static randomEnum<T>(anEnum: T): T[keyof T] {
        const enumValues = Object.keys(anEnum)
          .map(n => Number.parseInt(n))
          .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
        const randomIndex = Math.floor(Math.random() * enumValues.length)
        const randomEnumValue = enumValues[randomIndex]
        return randomEnumValue;
      }

}