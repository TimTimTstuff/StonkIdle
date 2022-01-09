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
import { UIHelper } from './logic/module/calculator/UiHelper';

function App() {

  Game.getInstance()
  console.log('Call App')

  return (
    <div className="App" id='stonks'>
      {getHeader()}
      {getBox1()}
      {getBox2()}
      {getBox3()}
      {getBox4()}

      <Popup />
      <TransactionNumbers />
      <div className='clearFloat'></div>
    </div>
  );

  function getBox4() {
    
    return <div className='gameBox' id='box4'>
      <NewsWindow />
      <GameLog />
    </div>;
  }

  function getBox3() {
    
    return <div className='gameBox' id='box3'>
      <StoreWindow />
    </div>;
  }

  function getBox2() {
    
    return <div className='gameBox' id='box2'>
      <DepotView />
    </div>;
  }

  function getBox1() {
    
    return <div className='gameBox' id='box1'>
      <BusinessChart  />
    </div>;
  }

  function getHeader() {
   
    return <div className='gameBoxHeader' id='boxHeader'>
      <TimeBox ticks={0} useGameTime={true} />
      <AccountWindow />
      <GlobalInfo />
    </div>;
  }
}

export default App;
