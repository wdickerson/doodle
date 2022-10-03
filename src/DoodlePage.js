import { useRef, useEffect, useState } from 'react'

const API_HOST = process.env.REACT_APP_DOODLE_API_HOST;

const DoodlePage = ({ editEnabled, setEditEnabled, doodleId }) => {
  const myCanvas = useRef(null);
  const [holdForPan, setHoldForPan] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const currentDoodle = useRef([]);
  const allDoodles = useRef([]);

  useEffect(() => {
    if (myCanvas.current) {
      setCtx(myCanvas.current.getContext('2d'));
    }
  }, [myCanvas]);



  const getDoodles = () => {
    if (!doodleId) {
      return;
    }
    // setSearchPending(true);

    fetch(`${API_HOST}/doodles/${doodleId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => res.json()).then((response) => {
        console.log('got doodles')
        // setFetchedPhotos(searchResponse.results || []);
        // setSearchPending(false);
      },
      (err) => {
        console.log('There was an error getting doodles');
        console.log(err);
        // setSearchPending(false);     
      }
    );
  }




  const postDoodle = (doodle) => {
    // setUploadPending(true);
    fetch(`${API_HOST}/doodles/${doodleId}`, {
      method: 'POST',
      // headers: {
      //   // 'custom-labels': customLabelText,
      // },
      body: JSON.stringify(doodle)
    }).then(res => res.text()).then((result) => {
        console.log('doodle posted');

        // fileInput.current.value = null;
        // setSelectedFile(null);
        // setPreviewDataUrl(null);
        // setUploadPending(false);
        // setCustomLabelText('');
      },
      (err) => {
        console.log('There was an error posting doodle');
        console.log(err);
        // setUploadPending(false);
      }
    );
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
    const myX = (pageX - offsetLeft) * 2;
    const myY = (pageY - offsetTop) * 2;

    setX(myX);
    setY(myY);
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
    const myX = (pageX - offsetLeft) * 2;
    const myY = (pageY - offsetTop) * 2;

    setX(myX);
    setY(myY);
    if (!holdForPan) draw(myX, myY);
  }

  const draw = (newX, newY) => {
    ctx.beginPath(); // begin
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.moveTo(x, y); // from
    ctx.lineTo(newX, newY); // to
    ctx.stroke(); // draw it!
    currentDoodle.current.push([x, y, newX, newY])
  }

  const handleReset = () => {
    currentDoodle.current = [];
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);
    fastReDraw();
  }

  const handleAdd = () => {
    setEditEnabled(true);
    fastReDraw();
  }

  const handleDone = () => {
    if (currentDoodle.current.length > 0) {
      // post your doodle!
      // postDoodle(currentDoodle.current);

      allDoodles.current.push(currentDoodle.current);
      currentDoodle.current = [];
    }
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);
    setEditEnabled(false);
  }

  const fastReDraw = () => {
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);

    allDoodles.current.forEach((doodle, i) => {
      doodle.forEach((step, j) => {
        const rX = step[0];
        const rY = step[1];
        const rNewX = step[2];
        const rNewY = step[3];
        ctx.beginPath(); // begin
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.moveTo(rX, rY); // from
        ctx.lineTo(rNewX, rNewY); // to
        ctx.stroke(); // draw it!
      })
    })
  }


  const reDraw = () => {
    ctx.clearRect(0, 0, myCanvas.current.width, myCanvas.current.height);

    const timeDelays = [0]
    allDoodles.current.forEach((doodle, i) => {
      timeDelays.push(timeDelays[i] + (doodle.length * 5));
    });

    allDoodles.current.forEach((doodle, i) => {
      setTimeout(() => {
        doodle.forEach((step, j) => {
          setTimeout(() => {
            const rX = step[0];
            const rY = step[1];
            const rNewX = step[2];
            const rNewY = step[3];
            ctx.beginPath(); // begin
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';
            ctx.moveTo(rX, rY); // from
            ctx.lineTo(rNewX, rNewY); // to
            ctx.stroke(); // draw it!
          }, (j * 5))
        })
      }, timeDelays[i] + (i * 500))
    })
  }

  let countText = 'There are no doodles yet!';
  if (allDoodles.current.length === 1) {
    countText = "There's 1 doodle! Click below to see it.";
  }
  if (allDoodles.current.length > 1) {
    countText = `There are ${allDoodles.current.length} doodles! Click below to see them.`
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
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

        </canvas>
        {editEnabled && (
          <>
          <button onClick={handleReset}>
            Reset
          </button>
          <span>&nbsp;</span>
          </>
        )}
        {editEnabled && (
          <button onClick={handleDone}>
            Done!
          </button>
        )}

        {!editEnabled && <p>{countText}</p>}

        {!editEnabled && (
          <>
            <button onClick={handleAdd}>
              Add a Doodle!
            </button>
            <span>&nbsp;</span>
          </>
        )}

        {!editEnabled && allDoodles.current.length > 0 && (
          <button onClick={reDraw}>
            See the Doodles!
          </button>
        )}

      </div>
  );
};

export default DoodlePage;