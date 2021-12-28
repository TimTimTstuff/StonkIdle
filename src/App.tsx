import './App.css';
import { BusinessChart } from './components/BusinessChart';
import { GameLog } from './components/GameLog';
import { TimeBox } from './components/TimeBox';
import { Game } from './logic/Game';

function App() {

  Game.getInstance()
  console.log('Call App')

  return (
    <div className="App" id='stonks'>
      <div className='gameBoxHeader' id='boxHeader'>
        <TimeBox ticks={0} useGameTime={true} />
      </div>
      <div className='gameBox' id='box1'>
        <BusinessChart shortName='AAA' />
      </div>

      <div className='gameBox' id='box2'>
        <GameLog  />
      </div>

      <div className='gameBox' id='box3'>
        t
      </div>

      <div className='gameBox' id='box4'>
        t
      </div>
    </div>
  );
}

export default App;
