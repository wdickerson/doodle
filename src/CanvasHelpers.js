export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 1000;

export const COLORS = {
  black: '#000000',
  blue: '#0000FF',
  red: '#FF0000',
  green: '#008000',
  yellow: '#DDCB00',
}

export function clearCanvas(ctx) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function drawStroke(ctx, x0, y0, x1, y1, color) {
  ctx.beginPath(); // begin
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.moveTo(x0, y0); // from
  ctx.lineTo(x1, y1); // to
  ctx.stroke(); // draw it!
}

export function instantRedrawSingleDoodle(ctx, doodle, newColor) {
  doodle.forEach((gesture) => {
    gesture.forEach(step => {
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
    });
  });
}

export function instantRedrawDoodles(ctx, fetchedDoodles) {
  clearCanvas(ctx);
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
      ctx.moveTo(rX, rY); // from
      ctx.lineTo(rNewX, rNewY); // to
      ctx.stroke(); // draw it!
    })
  })
}

export function animatedRedrawDoodles(ctx, fetchedDoodles) {
  clearCanvas(ctx);
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
