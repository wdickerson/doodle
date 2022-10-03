import './App.css';
// import WordRow from './WordRow.js';
// import Keyboard from './Keyboard.js';
import SettingsModal from './SettingsModal.js';
import GameHeader from './GameHeader.js';
import DoodlePage from './DoodlePage.js';
import React, {useState} from 'react';

function App() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const doodleId = params['d'] || '';


  const [showSettings, setShowSettings] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);


  return (
    <div className="App">
      {
        showSettings && (
          <SettingsModal 
            setShowSettings={setShowSettings} 
            // changeWord={changeWord}
            // allowedGuesses={allowedGuesses}
            // changeAllowedGuesses={changeAllowedGuesses}
          />
        )
      }
      <GameHeader 
        showSettings={showSettings} 
        setShowSettings={setShowSettings} 
        editEnabled={editEnabled}
        setEditEnabled={setEditEnabled}
      />
      <DoodlePage 
        editEnabled={editEnabled} 
        setEditEnabled={setEditEnabled} 
        doodleId={doodleId}
      />
    </div>
  );
}

export default App;
