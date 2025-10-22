import './App.css';
import MusicToggle from './components/MusicToggle';
import { FaGift } from 'react-icons/fa';
import SantaDraw from "./components/SantaDraw";

const SNOWFLAKE_COUNT = 20;

function Snowflakes() {
  return (
    <div className="snowflakes">
      {Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => (
        <span
          key={i}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}vw`,
            fontSize: `${1 + Math.random() * 2}em`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        >
          ❄️
        </span>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <>
      <MusicToggle />
      <Snowflakes />
      <div className="header">
        <FaGift className="holiday-icon" />
        <h1>
          <span className="twinkle">Santa Lotto</span>
        </h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', zIndex: 2, position: 'relative' }}>
        <SantaDraw />
      </div>
    </>
  );
}
