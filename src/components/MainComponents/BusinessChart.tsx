import { BarController, BarElement, CategoryScale, Chart, ChartData, LinearScale, LineController, LineElement, PointElement, Tooltip } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import { ChartJSOrUndefined } from "react-chartjs-2/dist/types";
import { GameCalculator } from "../../logic/module/calculator/GameCalculator";
import { GameFormating } from "../../logic/module/calculator/GameFormating";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { GameServices, GlobalEvents } from "../../logic/services";
import { BusinessCalculator } from "../../logic/services/businessCalculator/BusinessCalculator";
import { EventNames, GameConfig } from "../../logic/services/Config";
import { GS } from "../../logic/services/GS";
import { TimeService } from "../../logic/services/timeService/TimeService";
import './BusinessChart.css'

type bcProps = {
    shortName: string;
}

type bcState = {
    value: {
        changePercent: number,
        sellPrice: number,
        buyPrice: number,
        changePrice:number
    },
    shortName: string
}
const down = (ctx: any, value: any) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
const up = (ctx: any, value: any) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined;
export class BusinessChart extends React.Component<bcProps, bcState> {
    private _chartData: ChartData<any> = { labels: [], datasets: [{}] };
    private _currentComp: string;
    public static cartRef: ChartJSOrUndefined | null = undefined;
    private _businessToIndex: { [index: string]: number } = {}

    constructor(props: bcProps) {
        super(props);
        this.state = {
            value: {
                changePercent: 0,
                sellPrice: 0,
                buyPrice: 0,
                changePrice:0
            },
            shortName: props.shortName
        }
        this._currentComp = props.shortName
        this.initializeChart()
    }

    componentDidMount() {
        let event = GameServices.getService<GlobalEvents>(GlobalEvents.serviceName)
        event.subscribe(EventNames.periodChange, () => {
            this.fixChartData()
            this.changeCompany(this.state.shortName)
            GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness().forEach(b => {
                let s = b.stockPriceHistory[b.stockPriceHistory.length - 1];
                let pre = b.stockPriceHistory[b.stockPriceHistory.length - 2];
                this._chartData.datasets[this._businessToIndex[b.shortName]].data.push(s?.sellPrice)
                if (GameConfig.businessChartMaxPoints < (this._chartData.datasets[this._businessToIndex[b.shortName]].data.length ?? 0)) {
                    this._chartData.datasets[this._businessToIndex[b.shortName]].data.shift()
                }
                if (b.shortName === this._currentComp) {
                    this._chartData.labels?.push(GameServices.getService<TimeService>(TimeService.serviceName).getFormated('C/P', s?.date ?? 0))
                    this.setState({
                        value: {
                            sellPrice: s?.sellPrice ?? 0,
                            changePercent: (100 / pre.sellPrice * s.sellPrice) - 100,
                            buyPrice: s?.buyPrice ?? 0,
                            changePrice: (s.sellPrice-pre.sellPrice)
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

        event.subscribe(EventNames.selectedBusiness, (caller, shortName) => {
            this.changeCompany(shortName as string)
        })
    }
    fixChartData() {
       GS.getBusinessCalculator().getAllBusiness().forEach(b =>{

        let cd = this._chartData.datasets.find(c => c.label === b.shortName)
        if(cd === undefined){
            let index =  Object.keys(this._businessToIndex).length
            this._businessToIndex[b.shortName] = index

            this._chartData.datasets[index] = {
                data: [],
                label: b.shortName,
                business: b,
                borderWidth: 2,
                fill: true,
                backgroundColor: '#39d353',
                borderColor: '#39d353',
                fontColor: '#ffffff',
                spanGaps: true,
                radius: false,
                stepped:false,
                cubicInterpolationMode: 'monotone',
                segment: {
                    borderColor: (ctx: any) => down(ctx, '#b00b69') || up(ctx, '#39d353'),
                },
                
            }
        }

       })
    }

    initializeChart() {
        Chart.register(BarController, LineController, CategoryScale, LinearScale, BarController, BarElement, PointElement, LineElement, Tooltip)
        let counter = 0;
        GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness().forEach(b => {
            this._businessToIndex[b.shortName] = counter;
            this._chartData.datasets[counter] = {
                data: [],
                label: b.shortName,
                business: b,
                borderWidth: 2,
                fill: true,
                backgroundColor: '#39d353',
                borderColor: '#39d353',
                fontColor: '#ffffff',
                spanGaps: true,
                radius: false,
                stepped:false,
                cubicInterpolationMode: 'monotone',

                segment: {
                    borderColor: (ctx: any) => down(ctx, '#b00b69') || up(ctx, '#39d353'),
                },
                
            }
            counter++;
            this.changeCompany(b.shortName)
        })

        GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getAllBusiness().forEach(b => {
            b?.stockPriceHistory.forEach(s => {
                this._chartData.datasets[this._businessToIndex[b.shortName]].data.push(s?.sellPrice)
                this._chartData.datasets[this._businessToIndex[b.shortName]].hidden = b.shortName !== this._currentComp
                if (b.shortName === this._currentComp) {

                    this._chartData.labels?.push(GameServices.getService<TimeService>(TimeService.serviceName).getFormated('C/P', s?.date ?? 0))
                }
            })
        })

        this.changeCompany(this.state.shortName)
    }

    changeCompany(newComp: string) {
        this._currentComp = newComp;
        let buyPrice = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusiness(newComp)
        let price = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessCurrentPrices(newComp)
        let pre = buyPrice?.stockPriceHistory[buyPrice.stockPriceHistory.length - 2]
        if (pre === undefined) return
        // eslint-disable-next-line eqeqeq
        if (BusinessChart.cartRef == undefined) return
        for (var i = 0; i < BusinessChart.cartRef.data.datasets.length; i++) {
            BusinessChart.cartRef.data.datasets[i].hidden = i === this._businessToIndex[newComp] ? false : true;
        }

        BusinessChart.cartRef?.update()

        this.setState({
            shortName: newComp,
            value: {
                buyPrice: price.b,
                sellPrice: price.s,
                changePercent: (100 / pre?.sellPrice * price.s) - 100,
                changePrice: price.s-(pre?.sellPrice??0)
            }
        })
    }

    render(): React.ReactNode {
        let data = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusiness(this.state.shortName)
        let firstPrice = GameServices.getService<BusinessCalculator>(BusinessCalculator.serviceName).getBusinessFirstPrice(this.state.shortName)
        let changeChart = 100 / this.state.value.sellPrice * (this.state.value.sellPrice - firstPrice.s)
        return <div className="businessChart">
            <table style={UIHelper.isVisible(UIHelper.hasTutorialCheck(5))}>
                <thead>
                    <tr>
                        <th>Sell</th>
                        <th>Buy</th>
                        <th>Change</th>
                        <th>%</th>
                        <th>% Chart</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={this.state.value.changePercent > 0.0001 ? 'uptrend' : 'downtrend'}>{GameFormating.formatToRoundPostfix(this.state.value.sellPrice)}</td>
                        <td className={this.state.value.changePercent > 0.0001 ? 'uptrend' : 'downtrend'}>{GameFormating.formatToRoundPostfix(this.state.value.buyPrice)} </td>
                        <td className={this.state.value.changePercent > 0.0001 ? 'uptrend' : 'downtrend'}>{GameFormating.formatToRoundPostfix(this.state.value.changePrice,2,'€',true)} </td>
                        <td className={this.state.value.changePercent > 0.0001 ? 'uptrend' : 'downtrend'}>{GameFormating.formatToRoundPostfix(this.state.value.changePercent,2,'%',true)}</td>
                        <td className={changeChart > 0.0001 ? 'uptrend' : 'downtrend'}>{GameCalculator.roundValue(changeChart)}%</td>
                    </tr>
                </tbody>
            </table>

            <div className="floatLeft chartCompanyInfo">
                <span className="chartCompanyName">{data?.name}</span>
                <span className="chartCompanyNameShort">{data?.shortName}</span>
            </div>
            <Line style={UIHelper.isVisible(UIHelper.hasTutorialCheck(4))} className="chartPullLeft" ref={(reference) => { BusinessChart.cartRef = reference }} height={270} width={620} data={this._chartData} options={
                {

                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: 'Stonks'
                        },
                        tooltip:{
                            enabled:true,
                            mode:'nearest',
                            intersect:false,
                            

                        }
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
                                drawBorder: true,
                                drawOnChartArea: true,
                                color: '#61666d'
                            }
                        },
                        y: {
                            title: {
                                color: '#ffffff',
                                display: false,
                            },
                            grid: {
                                drawBorder: true,
                                drawOnChartArea: true,
                                color: '#61666d'
                            },
                            ticks: {
                                color: '#ffffff'
                            }

                        }
                    }
                }} />
        </div>
    }

}