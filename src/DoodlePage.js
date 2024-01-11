import { useRef, useEffect, useState } from 'react'
import { 
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  clearCanvas,
  instantRedrawSingleDoodle, 
  animatedRedrawDoodles, 
  instantRedrawDoodles, 
  drawStroke, 
} from './CanvasHelpers'
import ColorSelector from './ColorSelector.js';
import Button from './Button.js';
import Instructions from './Instructions.js';

const API_HOST = process.env.REACT_APP_DOODLE_API_HOST;

const MAX_ALLOWED_DOODLES = 16;

const DoodlePage = ({ editEnabled, setEditEnabled, doodleId }) => {
  const myCanvas = useRef(null);
  const x = useRef(0);
  const y = useRef(0);
  const currentDoodle = useRef([]);
  const currentGesture = useRef([]);
  const dampener = useRef(0);
  const [holdForPan, setHoldForPan] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [selectedColor, setSelectedColor] = useState(COLORS.black);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [fetchedDoodles, setFetchedDoodles] = useState([]);
  const [fetchPending, setFetchPending] = useState(false);
  const [postPending, setPostPending] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    // Fetch the doodles by ID
    if (doodleId) {
      getDoodles();
    }
  }, [doodleId]);

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
        if (response.doodles) {
          setFetchedDoodles(response.doodles);
        } else {
          // For now, if we get an unexpected response, assume the ID is bad and redirect
          if (window.history.replaceState) {
            const newurl = `${window.location.protocol}//${window.location.host}`;
            window.history.replaceState({ path: newurl }, '', newurl);
          }
        }
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
        if (response.doodles) setFetchedDoodles(response.doodles);
        clearCanvas(ctx);

        if (window.history.replaceState && response.doodle_id) {
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
        setCopiedToClipboard(true);
      }
    } else {
      // fallback code (ie, if accessing from PC without share api)
      navigator.clipboard.writeText(shareUrl);
      setCopiedToClipboard(true);
    }
  };

  const handleNew = () => {
    setCopiedToClipboard(false);
    if (window.history.replaceState) {
      const newurl = `${window.location.protocol}//${window.location.host}`;
      window.history.replaceState({ path: newurl }, '', newurl);
    }
    setFetchedDoodles([]);
    clearCanvas(ctx);
  };

  const recordGestureForUndo = () => {
    if (currentGesture.current.length > 0) {
      currentDoodle.current.push(currentGesture.current);
      currentGesture.current = [];
      setUndoAvailable(true);
    }
  }

  const dampen = () => {
    dampener.current++;
    if (dampener.current % 2 === 0) return false;
    return true
  }

  const handleMouseMove = (e) => {
    if (!editEnabled) return;
    if (dampen()) return;

    // Why * 2?
    // Our canvas has a logical size of 600x1000.
    // It's HTML element has a display width of 300px by 500px.
    // (Width is set in CSS, height maintains canvas aspect ratio.)
    // This result in a "higher resolution" drawing, especially when zooming.
    const myX = Math.max(e.nativeEvent.offsetX * 2, 0);
    const myY = Math.max(e.nativeEvent.offsetY * 2, 0);
    if (e.buttons === 1) {
      draw(myX, myY);
    } else {
      x.current = myX;
      y.current = myY;
    }
  }

  const handleTouchEnd = (e) => {
    if (editEnabled && !holdForPan) {
      recordGestureForUndo();
    }

    if (e.targetTouches.length === 0) {
      setHoldForPan(false);
      return;
    }
  }

  const handleMouseUp = (e) => {
    if (editEnabled) {
      recordGestureForUndo();
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
    const myX = Math.max(parseInt((pageX - offsetLeft) * 2), 0);
    const myY = Math.max(parseInt((pageY - offsetTop) * 2), 0);

    x.current = myX;
    y.current = myY;
  }

  const handleTouchMove = (e) => {
    if (!editEnabled) return;
    if (e.touches.length !== 1) {
      setHoldForPan(true);
      return;
    }
    if (dampen()) return;

    // get the x and y 
    const pageX = e.targetTouches[0].pageX;
    const pageY = e.targetTouches[0].pageY;
    
    const offsetLeft = e.targetTouches[0].target.offsetLeft;
    const offsetTop = e.targetTouches[0].target.offsetTop;
    const myX = Math.max(parseInt((pageX - offsetLeft) * 2), 0);
    const myY = Math.max(parseInt((pageY - offsetTop) * 2), 0);

    if (!holdForPan) draw(myX, myY);
  }

  const isRepeatedStroke = newStroke => {
    if (!currentGesture.current) return false;
    if (currentGesture.current.length === 0) return false;
    const previousStroke = currentGesture.current[currentGesture.current.length - 1];
    if (previousStroke[0] !== newStroke[0]) return false;
    if (previousStroke[1] !== newStroke[1]) return false;
    if (previousStroke[2] !== newStroke[2]) return false;
    if (previousStroke[3] !== newStroke[3]) return false;
    if (previousStroke[4] !== newStroke[4]) return false;
    return true;
  }

  const draw = (newX, newY) => {
    if (x.current < 0 || x.current < 0 || newX < 0 || newY < 0) return;

    if ((currentDoodle.current.flat(1).length + currentGesture.current.length) >= 750) {
      return;
    }

    if (isRepeatedStroke([x, y, newX, newY, selectedColor])) {
      return;
    }

    drawStroke(ctx, x.current, y.current, newX, newY, selectedColor)
    
    currentGesture.current.push([x.current, y.current, newX, newY, selectedColor]);
    x.current = newX;
    y.current = newY;
  }

  const handleUndo = () => {
    currentDoodle.current.pop();
    instantRedrawDoodles(ctx, fetchedDoodles);
    instantRedrawSingleDoodle(ctx, currentDoodle.current);

    if (currentDoodle.current.length === 0) {
      setUndoAvailable(false);
    }
  }

  const handleAdd = () => {
    setEditEnabled(true);
    setCopiedToClipboard(false);
    instantRedrawDoodles(ctx, fetchedDoodles);
  }

  const handleDone = () => {
    setEditEnabled(false);

    if (currentDoodle.current.length > 0 && fetchedDoodles.length < MAX_ALLOWED_DOODLES) {
      // post your doodle!
      // currentDoodle.current is an array of gestures
      // flatten it before posting
      postDoodle(currentDoodle.current.flat(1));
      currentDoodle.current = [];
    } else {
      clearCanvas(ctx);
    }
  }

  const changeColor = (newColor) => {
    setSelectedColor(newColor);
    instantRedrawDoodles(ctx, fetchedDoodles);
    instantRedrawSingleDoodle(ctx, currentDoodle.current, newColor);
  }

  const reDraw = () => {
    setCopiedToClipboard(false);
    animatedRedrawDoodles(ctx, fetchedDoodles);
  }

  let infoText = 'There are no doodles yet!';

  if (editEnabled) {
    infoText = '';
  } else if (copiedToClipboard) {
    infoText = 'The link to this Dickerdoodle was copied to your clipboard!';
  } else if (fetchPending) {
    infoText = 'Looking for doodles...';
  } else if (postPending) {
    infoText = 'Beautiful! Please wait';
  } else if (fetchedDoodles.length === 1) {
    infoText = "There's 1 doodle! Click below to see it";
  } else if (fetchedDoodles.length >= MAX_ALLOWED_DOODLES) {
    infoText = `This Dickerdoodle is full! Click below to see the doodles`
  } else if (fetchedDoodles.length > 1) {
    infoText = `There are ${fetchedDoodles.length} doodles! Click below to see them`
  } 

  return (
      <div className='DoodlePage'>
        <canvas 
          ref={myCanvas}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={editEnabled ? 'DoodleCanvasEdit' : 'DoodleCanvas'}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        <p>{infoText}</p>
        {editEnabled && (
          <>
            <div className='ColorSelectors'>
              <ColorSelector color={COLORS.black} selectedColor={selectedColor} changeColor={changeColor} />
              <ColorSelector color={COLORS.blue} selectedColor={selectedColor} changeColor={changeColor} />
              <ColorSelector color={COLORS.red} selectedColor={selectedColor} changeColor={changeColor} />
              <ColorSelector color={COLORS.green} selectedColor={selectedColor} changeColor={changeColor} />
              <ColorSelector color={COLORS.yellow} selectedColor={selectedColor} changeColor={changeColor} />
            </div>
            <Button 
              className='SettingsButton'
              onClick={handleUndo}
              disabled={!undoAvailable}
              text='Undo'
            />
            <Button 
              className='SettingsButton GreenButton'
              onClick={handleDone}
              text='Done!'
            />
            <p className='ZoomText'>Zoom in for easier doodling!</p>
          </>
        )}
        {!editEnabled && (
          <>
            <Button 
              className='SettingsButton'
              onClick={handleAdd}
              disabled={fetchPending || postPending || fetchedDoodles.length >= MAX_ALLOWED_DOODLES}
              text='Add a Doodle'
            />
            {fetchedDoodles.length > 0 && (
              <Button 
                className='SettingsButton'
                onClick={reDraw}
                disabled={fetchPending || postPending}
                text='See the Doodles!'
              />
            )}
            <Button 
              className='SettingsButton GreenButton'
              onClick={handleShare}
              disabled={!fetchedDoodles || fetchedDoodles.length === 0}
              text='Share this Dickerdoodle!'
            />
            <Instructions />
            <Button 
              className='SettingsButton'
              onClick={handleNew}
              text='Start a new Dickerdoodle!'
            />
          </>
        )}
      </div>
  );
};

export default DoodlePage;
