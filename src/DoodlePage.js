import { useRef, useEffect, useState } from 'react'

const API_HOST = process.env.REACT_APP_DOODLE_API_HOST;

/********* 
colors
black: #000000
blue: #0000FF
red: #FF0000
green: #008000
yellow: #FFFF00
**********/

const BLACK = '#000000';
const BLUE = '#0000FF';
const RED = '#FF0000';
const GREEN = '#008000';
const YELLOW = '#DDCB00';

const DoodlePage = ({ editEnabled, setEditEnabled, doodleId }) => {
  const myCanvas = useRef(null);
  const [holdForPan, setHoldForPan] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [selectedColor, setSelectedColor] = useState(BLACK);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const currentDoodle = useRef([]);
  const currentDoodleStartIndexes = useRef([]);
  const [fetchedDoodles, setFetchedDoodles] = useState([]);
  const [fetchPending, setFetchPending] = useState(false);
  const [postPending, setPostPending] = useState(false);

  useEffect(() => {
    // lets fetch doodles
    if (doodleId) {
      console.log('HERE!!! lets fetch')
      getDoodles();
    }
  }, []);

  useEffect(() => {
    if (myCanvas.current) {
      setCtx(myCanvas.current.getContext('2d'));
    }
  }, [myCanvas]);

  const getDoodles = () => {
    if (!doodleId) {
      return;
    }
    setFetchPending(true);
    
    fetch(`${API_HOST}/doodles/${doodleId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => res.json()).then((response) => {
      setFetchPending(false);
        console.log('got doodles')
        // console.log(response)
        setFetchedDoodles(response.doodles);
        // setFetchedPhotos(searchResponse.results || []);
        // setSearchPending(false);
      },
      (err) => {
        setFetchPending(false);
        console.log('There was an error getting doodles');
        console.log(err);

        // For now, if we get an error, assume the ID is bad and redirect
        if (window.history.replaceState) {
          const newurl = `${window.location.protocol}//${window.location.host}`;
          window.history.replaceState({ path: newurl }, '', newurl);
        }
      }
    );
  }

  const postDoodle = (doodle) => {
    setPostPending(true);
    fetch(`${API_HOST}/doodles/${doodleId}`, {
      method: 'POST',
      body: JSON.stringify(doodle)
    }).then(res => res.json()).then((response) => {
        setFetchedDoodles(response.doodles);
        ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);

        if (window.history.replaceState) {
          const newurl = `${window.location.protocol}//${window.location.host}/${response.doodle_id}`;
          window.history.replaceState({ path: newurl }, '', newurl);
        }
        setPostPending(false);
      },
      (err) => {
        console.log('There was an error posting doodle');
        console.log(err);
        setPostPending(false);
      }
    );
  }

  const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`;
  const shareDetails = { 
    url: shareUrl, 
    title: 'Dickerdoodle!', 
    text: 'See the doodles and add your own!'
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareDetails);
      } catch (error) {
        navigator.clipboard.writeText(shareUrl);
        // setCopiedToClipboard(true);
      }
    } else {
      // fallback code
      navigator.clipboard.writeText(shareUrl);
      // setCopiedToClipboard(true);
    }
  };



  const handleNew = () => {
    if (window.history.replaceState) {
      const newurl = `${window.location.protocol}//${window.location.host}`;
      window.history.replaceState({ path: newurl }, '', newurl);
    }
    setFetchedDoodles([]);
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);
  };


  const handleMouseDown = () => {
    if (!editEnabled) return;
    currentDoodleStartIndexes.current.push(currentDoodle.current.length);
    setUndoAvailable(true);
  }

  const handleMouseMove = (e) => {
    if (!editEnabled) return;
    const myX = e.nativeEvent.offsetX * 2;
    const myY = e.nativeEvent.offsetY * 2;
    setX(myX);
    setY(myY);
    if (e.buttons !== 1) return;
    draw(myX, myY);
  }

  const handleTouchEnd = (e) => {
    if (e.targetTouches.length === 0) {
      setHoldForPan(false);
      return;
    }
  }

  const handleTouchStart = (e) => {
    if (!editEnabled) return;
    if (e.touches.length !== 1) {
      setHoldForPan(true);
      return;
    }

    // get the x and y 
    const pageX = e.targetTouches[0].pageX;
    const pageY = e.targetTouches[0].pageY;
    const offsetLeft = e.targetTouches[0].target.offsetLeft;
    const offsetTop = e.targetTouches[0].target.offsetTop;
    const myX = parseInt((pageX - offsetLeft) * 2);
    const myY = parseInt((pageY - offsetTop) * 2);

    setX(myX);
    setY(myY);

    currentDoodleStartIndexes.current.push(currentDoodle.current.length);
    setUndoAvailable(true);
  }

  const handleTouchMove = (e) => {
    if (!editEnabled) return;
    if (e.touches.length !== 1) {
      setHoldForPan(true);
      return;
    }

    // get the x and y 
    const pageX = e.targetTouches[0].pageX;
    const pageY = e.targetTouches[0].pageY;
    
    const offsetLeft = e.targetTouches[0].target.offsetLeft;
    const offsetTop = e.targetTouches[0].target.offsetTop;
    const myX = parseInt((pageX - offsetLeft) * 2);
    const myY = parseInt((pageY - offsetTop) * 2);

    setX(myX);
    setY(myY);
    if (!holdForPan) draw(myX, myY);
  }

  const draw = (newX, newY) => {
    ctx.beginPath(); // begin
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = selectedColor;
    ctx.moveTo(x, y); // from
    ctx.lineTo(newX, newY); // to
    ctx.stroke(); // draw it!
    currentDoodle.current.push([x, y, newX, newY, selectedColor]);
  }

  const handleUndo = () => {
    const lastStrokeEndIndex = currentDoodleStartIndexes.current.pop();
    currentDoodle.current = currentDoodle.current.splice(0, lastStrokeEndIndex);
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);
    fastReDraw();

    reDrawCurrentDoodle();

    if (currentDoodle.current.length < 1) {
      setUndoAvailable(false);
    }
  }

  const handleAdd = () => {
    setEditEnabled(true);
    fastReDraw();
  }

  const handleDone = () => {
    setEditEnabled(false);

    if (currentDoodle.current.length > 0) {
      // post your doodle!
      postDoodle(currentDoodle.current);
      currentDoodle.current = [];
    } else {
      ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);
    }
  }

  const changeColor = (newColor) => {
    setSelectedColor(newColor);
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);
    fastReDraw();
    reDrawCurrentDoodle(newColor);
  }

  const reDrawCurrentDoodle = (newColor = null) => {
    currentDoodle.current.forEach((step) => {
      if (newColor) step[4] = newColor;
      const rX = step[0];
      const rY = step[1];
      const rNewX = step[2];
      const rNewY = step[3];
      const hexColor = step[4] || '#000000';
      ctx.beginPath(); // begin
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = hexColor;
      ctx.moveTo(rX, rY); // from
      ctx.lineTo(rNewX, rNewY); // to
      ctx.stroke(); // draw it!
    })
  }

  const fastReDraw = () => {
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);

    fetchedDoodles.forEach((doodle, i) => {
      doodle.forEach((step, j) => {
        const rX = step[0];
        const rY = step[1];
        const rNewX = step[2];
        const rNewY = step[3];
        const hexColor = step[4] || '#000000';
        ctx.beginPath(); // begin
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = hexColor;
        // ctx.strokeStyle = '#000000';
        ctx.moveTo(rX, rY); // from
        ctx.lineTo(rNewX, rNewY); // to
        ctx.stroke(); // draw it!
      })
    })
  }


  const reDraw = () => {
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);

    const timeDelays = [0]
    fetchedDoodles.forEach((doodle, i) => {
      timeDelays.push(timeDelays[i] + (doodle.length * 5));
    });

    fetchedDoodles.forEach((doodle, i) => {
      setTimeout(() => {
        doodle.forEach((step, j) => {
          setTimeout(() => {
            const rX = step[0];
            const rY = step[1];
            const rNewX = step[2];
            const rNewY = step[3];
            const hexColor = step[4] || '#000000';
            ctx.beginPath(); // begin
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = hexColor;
            ctx.moveTo(rX, rY); // from
            ctx.lineTo(rNewX, rNewY); // to
            ctx.stroke(); // draw it!
          }, (j * 5))
        })
      }, timeDelays[i] + (i * 500))
    })
  }

  let infoText = 'There are no doodles yet!';

  if (editEnabled) {
    infoText = '';
  } else if (fetchPending) {
    infoText = 'Looking for doodles...';
  } else if (postPending) {
    infoText = 'Beautiful! Please wait';
  } else if (fetchedDoodles.length === 1) {
    infoText = "There's 1 doodle! Click below to see it";
  } else if (fetchedDoodles.length > 1) {
    infoText = `There are ${fetchedDoodles.length} doodles! Click below to see them`
  }

  return (
      <div 
        className='DoodlePage'
      >
        <canvas 
          ref={myCanvas} 
          width="600" 
          height="1000"
          className={editEnabled ? 'DoodleCanvasEdit' : 'DoodleCanvas'}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        <p>{infoText}</p>

        {editEnabled && (
          <>
            <div className='ColorSelectors'>
              {selectedColor === BLACK && <div className='ColorSelector ColorBlack ColorSelected' />}
              {selectedColor !== BLACK && <div className='ColorSelector ColorBlack' onClick={() => changeColor(BLACK)} />}
              {selectedColor === BLUE && <div className='ColorSelector ColorBlue ColorSelected' />}
              {selectedColor !== BLUE && <div className='ColorSelector ColorBlue' onClick={() => changeColor(BLUE)} />}
              {selectedColor === RED && <div className='ColorSelector ColorRed ColorSelected' />}
              {selectedColor !== RED && <div className='ColorSelector ColorRed' onClick={() => changeColor(RED)} />}
              {selectedColor === GREEN && <div className='ColorSelector ColorGreen ColorSelected' />}
              {selectedColor !== GREEN && <div className='ColorSelector ColorGreen' onClick={() => changeColor(GREEN)} />}
              {selectedColor === YELLOW && <div className='ColorSelector ColorYellow ColorSelected' />}
              {selectedColor !== YELLOW && <div className='ColorSelector ColorYellow' onClick={() => changeColor(YELLOW)} />}
            </div>
            <button 
              className='SettingsButton'
              onClick={handleUndo}
              disabled={!undoAvailable}
            >
              Undo
            </button>
            <span>&nbsp;</span>
            <button 
              className='SettingsButton GreenButton'
              onClick={handleDone}
            >
              Done!
            </button>
          </>
        )}

        {!editEnabled && (
          <>
            <button 
              className='SettingsButton'
              onClick={handleAdd}
              disabled={fetchPending || postPending}
            >
              Add a Doodle
            </button>
            <span>&nbsp;</span>
          </>
        )}

        {!editEnabled && fetchedDoodles.length > 0 && (
          <button 
            className='SettingsButton'
            onClick={reDraw}
            disabled={fetchPending || postPending}
          >
            See the Doodles!
          </button>
        )}
        <p></p>
        
        {!editEnabled && (
          <button 
            className='SettingsButton GreenButton'
            onClick={handleShare}
            disabled={!fetchedDoodles || fetchedDoodles.length === 0}
          >
            Share this Dickerdoodle!
          </button>
        )}

        {!editEnabled && (
          <>
            <p className='HelpTitle'>How to Play</p>
            {
              fetchedDoodles.length > 0 && (
                <p className='HelpText'>Tap "See the doodles" to see what others have drawn</p>
              )
            }
            <p className='HelpText'>
              Tap "Add a doodle" and draw a new doodle 
              <strong>. Tip:</strong> Zoom in for easier doodling
            </p>
            <p className='HelpText'>
              Tap "Share this Dickerdoodle" and send it to a friend! 
            </p>
            <button className='SettingsButton' onClick={handleNew}>
              Start a new Dickerdoodle
            </button>
            <p className='FooterText'>
              Created by William Dickerson 
              <a className="link" href="https://github.com/wdickerson">
                  <i className="fa fa-github"></i>
              </a>
              <a className="link" href="https://www.linkedin.com/in/wdickerson08">
                  <i className="fa fa-linkedin-square"></i>
              </a> 
            </p>
          </>
        )}
      </div>
  );
};

export default DoodlePage;