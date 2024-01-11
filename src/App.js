import './App.css';
import GameHeader from './GameHeader.js';
import DoodlePage from './DoodlePage.js';
import Footer from './Footer.js';
import React, {useState} from 'react';

function App() {
  const doodleId = window.location.pathname.split('/')[1] || '';

  const [editEnabled, setEditEnabled] = useState(false);

  return (
    <div className="App">
      <GameHeader />
      <DoodlePage 
        editEnabled={editEnabled} 
        setEditEnabled={setEditEnabled} 
        doodleId={doodleId}
      />
      <Footer />
    </div>
  );
}

export default App;
