import './App.css';
import './global.css'
import { Popup } from './components/GenericComponents/Popup';
import { TransactionNumbers } from './components/GenericComponents/TransactionNumbers';
import { GameLog } from './components/InfoComponents/GameLog';
import { GlobalInfo } from './components/InfoComponents/GlobalInfo';
import { TimeBox } from './components/InfoComponents/TimeBox';
import { AccountWindow } from './components/MainComponents/AccountWindow';
import { BusinessChart } from './components/MainComponents/BusinessChart';
import { DepotView } from './components/MainComponents/DepotView';
import { StoreWindow } from './components/MainComponents/StoreWindow';
import { Game } from './logic/Game';
import { NewsWindow } from './components/InfoComponents/NewsWindow';

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
        <NewsWindow />
        <GameLog />
      </div>
      <Popup />
      <TransactionNumbers />
      <div className='clearFloat'></div>
    </div>
  );
}

export default App;
