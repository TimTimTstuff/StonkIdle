import './App.css';
import { AccountWindow } from './components/AccountWindow';
import { BusinessChart } from './components/BusinessChart';
import { DepotView } from './components/DepotView';
import { GameLog } from './components/GameLog';
import { GlobalInfo } from './components/GlobalInfo';
import { TimeBox } from './components/TimeBox';
import { Game } from './logic/Game';

function App() {

  Game.getInstance()
  console.log('Call App')

  return (
    <div className="App" id='stonks'>
      <div className='gameBoxHeader' id='boxHeader'>
        <TimeBox ticks={0} useGameTime={true} /> <AccountWindow /> <GlobalInfo />
      </div>
      <div className='gameBox' id='box1'>
        <BusinessChart shortName='AAA' />
      </div>

      <div className='gameBox' id='box2'>
        <DepotView />
      </div>

      <div className='gameBox' id='box3'>
      <div className='tabBox'>
          <div className='tabBoxHeader'>
            <div className='tabBoxHeaderItem noselect'>Accounts</div>
            <div className='tabBoxHeaderItem noselect'>Depot</div>
          </div>
          <div className='tabBoxContent'>
            <div className='tabBoxContentItem tab1'>Tab 1</div>
            <div className='tabBoxContentItem tab2'>Tab 2</div>
          </div>
        </div>
      </div>

      <div className='gameBox' id='box4'>
        <GameLog />
      </div>
    </div>
  );
}

export default App;
