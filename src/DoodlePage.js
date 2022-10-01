import { useRef, useEffect, useState } from 'react'

const DoodlePage = ({ editEnabled, setEditEnabled }) => {
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
  }, [myCanvas])

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
    const clientX = e.targetTouches[0].clientX;
    const clientY = e.targetTouches[0].clientY;
    const offsetLeft = e.targetTouches[0].target.offsetLeft;
    const offsetTop = e.targetTouches[0].target.offsetTop;
    const myX = (clientX - offsetLeft) * 2;
    const myY = (clientY - offsetTop) * 2;

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
    const clientX = e.targetTouches[0].clientX;
    const clientY = e.targetTouches[0].clientY;
    const offsetLeft = e.targetTouches[0].target.offsetLeft;
    const offsetTop = e.targetTouches[0].target.offsetTop;
    const myX = (clientX - offsetLeft) * 2;
    const myY = (clientY - offsetTop) * 2;

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

  const handleDone = () => {
    if (currentDoodle.current.length > 0) {
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

        {!editEnabled && (
          <button onClick={reDraw}>
            See the Doodles!
          </button>
        )}

      </div>
  );
};

export default DoodlePage;