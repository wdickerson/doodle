import { useState } from 'react'
// import { ReactComponent as Minus } from './Minus.svg';
// import { ReactComponent as Plus } from './Plus.svg';

const SettingsModal = ({ 
  setShowSettings
}) => {
  // const [pendingWord, setPendingWord] = useState('');
  // const [pendingGuesses, setPendingGuesses] = useState(allowedGuesses);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // const host = 'http://localhost:3000';
  const host = 'https://doodle.littleapp.io';

  const shareUrl = `${host}/taco`;
  // const shareUrl = `${host}?g=${pendingGuesses}&w=${encodeURIComponent(btoa(pendingWord))}`;

  const shareDetails = { 
    url: shareUrl, 
    title: 'Dickerdoodle', 
    text: 'Check out my latest doodle!'
  }

  const handleSharing = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareDetails);
      } catch (error) {
        navigator.clipboard.writeText(shareUrl);
        setCopiedToClipboard(true);
      }
    } else {
      // fallback code
      navigator.clipboard.writeText(shareUrl);
      setCopiedToClipboard(true);
    }
  };

  // const handleGuessDecrement = () => {
  //   setPendingGuesses(Math.max(1, pendingGuesses - 1));
  //   setCopiedToClipboard(false);
  // }

  // const handleGuessIncrement = () => {
  //   setPendingGuesses(pendingGuesses + 1);
  //   setCopiedToClipboard(false);
  // }

  // const handleTextInput = (value) => {
  //   setPendingWord(value.toUpperCase());
  //   setCopiedToClipboard(false);
  // }

  // const startGame = () => {
  //   changeWord(pendingWord);
  //   changeAllowedGuesses(pendingGuesses);
  //   setShowSettings(false);
  // }

  const copiedText = 'The link to this Dickerdoodle was copied to your clipboard!';

  return (
    <div className='SettingsModal'>
      <h1 className='SettingsHeader'>
        Start a New Dickerdoodle
      </h1>
      <p className='SettingsInfo'>
        Enter a phrase and set the number of guesses. <br/>
        Play on this device or share with a friend!
      </p>
   


      <div className='ShareSection'>
        <p className='ShareLinkText'>{shareUrl}</p>
        <p className='CopiedText'>{copiedToClipboard ? copiedText : ''}</p>
        <button className='SettingsButton GreenButton'
          onClick={handleSharing}
          // disabled={!pendingWord}
        >
          Share this Dickerdoodle!
        </button>
      </div>

      <div className='SettingsFooter'>
        <button 
          className='SettingsButton' 
          onClick={() => setShowSettings(false)}
        >
          Cancel
        </button>
        <button 
          className='SettingsButton GreenButton'
          // onClick={startGame}
          // disabled={!pendingWord}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
