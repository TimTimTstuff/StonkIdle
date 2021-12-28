import './App.css';
import { BusinessChart } from './components/BusinessChart';
import { TimeBox } from './components/TimeBox';
import { Game } from './logic/Game';

function App() {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let g = new Game();

  return (
    <div className="App" id='stonks'>
      <div className='gameBoxHeader' id='boxHeader'>
        <TimeBox ticks={0} useGameTime={true} />
      </div>
      <div className='gameBox' id='box1'>
        <BusinessChart shortName='AAA' />
      </div>

      <div className='gameBox' id='box2'>
        t
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
