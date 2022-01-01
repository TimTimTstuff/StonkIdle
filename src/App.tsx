import './App.css';
import { Popup } from './components/GenericComponents/Popup';
import { GameLog } from './components/InfoComponents/GameLog';
import { GlobalInfo } from './components/InfoComponents/GlobalInfo';
import { TimeBox } from './components/InfoComponents/TimeBox';
import { AccountWindow } from './components/MainComponents/AccountWindow';
import { BusinessChart } from './components/MainComponents/BusinessChart';
import { DepotView } from './components/MainComponents/DepotView';
import { StoreWindow } from './components/MainComponents/StoreWindow';
import { Game } from './logic/Game';

function App() {

  Game.getInstance()
  console.log('Call App')

  return (
    <div className="App" id='stonks'>
      <div className='gameBoxHeader'   id='boxHeader'>
         <TimeBox ticks={0} useGameTime={true} />
         <AccountWindow  /> 
         <GlobalInfo />
      </div>
      <div className='gameBox' id='box1'>
        <BusinessChart shortName='AAA' />
      </div>

      <div className='gameBox' id='box2'>
        <DepotView />
      </div>

      <div className='gameBox' id='box3'>
     <StoreWindow />
      </div>

      <div className='gameBox' id='box4'>
        <GameLog />
      </div>
      <Popup />
    </div>
  );
}

export default App;
