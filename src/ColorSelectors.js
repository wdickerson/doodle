import { COLORS } from './CanvasHelpers'

const classes = {
  [COLORS.black]: 'ColorBlack',
  [COLORS.blue]: 'ColorBlue',
  [COLORS.red]: 'ColorRed',
  [COLORS.green]: 'ColorGreen',
  [COLORS.yellow]: 'ColorYellow',
}

const ColorSelector = ({ color, selectedColor, changeColor }) => {
  if (color === selectedColor) {
    return (
      <div className={`ColorSelector ColorSelected ${classes[color]}`} />
    )
  } else {
    return (
      <div className={`ColorSelector ${classes[color]}`} onClick={() => changeColor(color)} />
    )
  }
};

const ColorSelectors = ({ selectedColor, changeColor }) => {
  return (
    <div className='ColorSelectors'>
      <ColorSelector color={COLORS.black} selectedColor={selectedColor} changeColor={changeColor} />
      <ColorSelector color={COLORS.blue} selectedColor={selectedColor} changeColor={changeColor} />
      <ColorSelector color={COLORS.red} selectedColor={selectedColor} changeColor={changeColor} />
      <ColorSelector color={COLORS.green} selectedColor={selectedColor} changeColor={changeColor} />
      <ColorSelector color={COLORS.yellow} selectedColor={selectedColor} changeColor={changeColor} />
    </div>  )
};

export default ColorSelectors;
