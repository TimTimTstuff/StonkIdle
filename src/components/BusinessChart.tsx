import { BarController, BarElement, CategoryScale, Chart, ChartData, LinearScale, LineController, LineElement, PointElement } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import { ChartJSOrUndefined } from "react-chartjs-2/dist/types";
import { GameServices, GlobalEvents } from "../logic/services";
import { BusinessCalculator } from "../logic/services/businessCalculator/BusinessCalculator";
import { EventNames, GameConfig } from "../logic/services/Config";
import { TimeService } from "../logic/services/timeService/TimeService";
import './BusinessChart.css'

type bcProps = {
    shortName: string;
}

type bcState = {
    value: {
        changePercent: number,
        currentValue: number,
        buyValue:number
    },
    shortName:string
}
const down = (ctx: any, value: any) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
const up = (ctx: any, value: any) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined;
export class BusinessChart extends React.Component<bcProps, bcState> {
    private _chartData: ChartData<any> = { labels: [], datasets: [{}] };
    private _currentComp: string;
    public static cartRef: ChartJSOrUndefined | null = undefined;
    private _businessToIndex: {[index:string]:number} = {}

    /**
     *
     */
    constructor(props: bcProps) {
        super(props);
        this.state = {
            value: {
                changePercent: 0,
                currentValue: 1,
                buyValue:0
            },
            shortName: props.shortName
        }
        this._currentComp = props.shortName
        this.initializeChart()
        let event = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)

        event.subscribe(EventNames.periodChange, () => {

            GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness().forEach(b => {
                let s = b.stockPriceHistory[b.stockPriceHistory.length - 1];
                this._chartData.datasets[this._businessToIndex[b.shortName]].data.push(s?.sellPrice)
                if (GameConfig.businessChartMaxPoints < (this._chartData.labels?.length ?? 0)) {
                    this._chartData.datasets[0].data.shift()
                } 
                if(b.shortName === this._currentComp) {
                    this._chartData.labels?.push(GameServices.getService<TimeService>(TimeService.serviceName).getFormated('A/C/P (T)', s?.date ?? 0))
                    this.setState({
                        value: {
                            currentValue: s?.sellPrice??0,
                            changePercent: 0,
                            buyValue: s?.buyPrice??0
                        },
                        shortName: this._currentComp
                    })
                }
            })

            if (GameConfig.businessChartMaxPoints < (this._chartData.labels?.length ?? 0)) {
                this._chartData.labels?.shift()
            }

            BusinessChart.cartRef?.update()
        })

        event.subscribe(EventNames.selectedBusiness,(caller, shortName) =>{
            this.changeCompany(shortName as string)
        })
    }

    initializeChart() {
        Chart.register(BarController, LineController, CategoryScale, LinearScale, BarController, BarElement, PointElement, LineElement)
        let counter = 0;
        GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness().forEach(b => {
            this._businessToIndex[b.shortName] = counter;
            this._chartData.datasets[counter] = {
                data: [],
                label: 'Stonk: '+b.shortName,
                business: b,
                borderWidth: 3,
                fill: false,
                backgroundColor: '#39d353',
                borderColor: '#39d353',
                fontColor: '#ffffff',
                spanGaps: true,
                radius: false,
                segment: {
                    borderColor: (ctx: any) => down(ctx, '#b00b69') || up(ctx, '#39d353'),
                }
            }
            counter++;

        })
        GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness().forEach(b => {
            b?.stockPriceHistory.forEach(s => {
                this._chartData.datasets[this._businessToIndex[b.shortName]].data.push(s?.sellPrice)
                this._chartData.datasets[this._businessToIndex[b.shortName]].hidden = b.shortName !== this._currentComp
                if(b.shortName === this._currentComp){
                    
                    this._chartData.labels?.push(GameServices.getService<TimeService>(TimeService.serviceName).getFormated('A/C/P (T)', s?.date ?? 0))
                }
            })
        })
        this.changeCompany(this.state.shortName)
    }

    changeCompany(newComp:string){
        this._currentComp = newComp;
        
        for(var i = 0; i< this._chartData.datasets.length; i++){
            // eslint-disable-next-line eqeqeq
            if(BusinessChart.cartRef == undefined) return  
                BusinessChart.cartRef.data.datasets[i].hidden = i===this._businessToIndex[newComp]?false:true;
        }

        BusinessChart.cartRef?.update()

        this.setState({
            shortName: newComp,
        })
    }

    render(): React.ReactNode {

        let data = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusiness(this.state.shortName)

        return <div>
            <span>{data?.name}</span>
            <span> Price: <span className={this.state.value.changePercent > 0 ? 'uptrend' : 'downtrend'}>{Math.round(this.state.value.currentValue * 100) / 100}€ {Math.round(this.state.value.changePercent * 100) / 100}%</span></span>
            <span></span>
            <Line ref={(reference) => {BusinessChart.cartRef = reference}} height={270} width={620} data={this._chartData} options={
                {
                    responsive: true,
                    interaction: {
                        intersect: true
                    },
                    color: '#ffffff',
                    scales: {

                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            title: {
                                color: '#ffffff',
                                text: '#ffffff',
                                display: false,
                            },
                            grid: {
                                drawBorder: false,
                                drawOnChartArea: false,
                                color: '#ffffff'
                            }
                        },
                        y: {
                            title: {
                                color: '#ffffff',
                                display: true,
                            },
                            grid: {
                                drawBorder: false,
                                drawOnChartArea: false,
                                color: '#ffffff'
                            },
                            ticks: {
                                color: '#ffffff'
                            },
                        }
                    }
                }} />
        </div>
    }

}