import { Routes, Route } from "react-router-dom";
import Forms from './components/Forms.js';
import Main from './components/Main.js';
import Bio from './components/pages/Bio.js';
import Inventory from './components/pages/Inventory.js';

function App() {

  return (
    <div>
      <Routes>
        <Route path="/bio" element={<Bio />}></Route> 
        <Route path="/" element={<Forms />}></Route> 
        <Route path="/main" element={<Main />}></Route>
        <Route path="/inventory" element={<Inventory />}></Route>
      </Routes>
    </div>
  );
}

export default App;
