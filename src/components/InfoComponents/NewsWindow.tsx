import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { UIHelper } from "../../logic/module/calculator/UiHelper";
import { EventNames, GameFlags } from "../../logic/services/Config";
import { NewsData } from "../../logic/services/dataServices/NewsService";
import { GS } from "../../logic/services/GS";
import './NewsWindow.css'

type NewsState = {
    update: string
}

export class NewsWindow extends React.Component<{}, NewsState>{

    componentDidMount() {
        GS.getGlobalEvents().subscribe(EventNames.periodChange, () => {
            this.setState({ update: 'hello' })
        })
    }

    render(): React.ReactNode {
        let newsContent: React.ReactNode = (<i>Please get a News-Subscription to read the latest News!</i>)

        if (GS.getFlagService().getFlagInt(GameFlags.n_n_AbonementTime) > 0) {
            newsContent = GS.getNewsService().getAllNews().map((news, id) => {
                return this.getNewsBox(id, news)
            })
        }
        if(!UIHelper.hasTutorialCheck(5)) return ''
        return (<div className="newsWindow">
            <h2 className="newsWindowHeader">Market News</h2><small>Subscription for {GS.getFlagService().getFlagInt(GameFlags.n_n_AbonementTime)} Periods</small>
            <div className="newsWindowContent">
                {newsContent}
            </div>
        </div>)
    }

    private getNewsBox(id: number, news: NewsData): JSX.Element {
        let newsTime = GS.getTimeService().getTimeBox(news.cTime)
        let isNew = GS.getTimeService().getCurrentPeriod() == newsTime.period
        return <div key={id} className="newsWindowItem">
            <div className="newsItemImage"><FontAwesomeIcon className={news.cssClass} icon={news.icon} /></div>
            <div className="newsItemContent">
                <div className={"newsItemHeader"}> {news.title} <small className={(isNew?'topNews':'')+" newsTime"}>{GS.getTimeService().getFormated('A/C/P',news.cTime)}</small></div>
                <div className="newsItemText">{news.news}</div>
            </div>
            <div className="clearFloat"></div>
        </div>;
    }
}