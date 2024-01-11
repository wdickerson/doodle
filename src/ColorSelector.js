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

export default ColorSelector;
