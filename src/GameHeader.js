import { ReactComponent as SettingsCog } from './SettingsCog.svg';
import { ReactComponent as EditPencil } from './EditPencil.svg';

const GameHeader = ({ showSettings, setShowSettings, editEnabled, setEditEnabled }) => {
  return (
      <div className='Header'>
        <div className='HeaderSettings' onClick={() => setShowSettings(true)}>
          {!showSettings && <SettingsCog />}
        </div>
        <div className='HeaderText'>Dickerdoodle</div>
        <div className='HeaderSettings' onClick={() => setEditEnabled(true)}>
          {!editEnabled && <EditPencil />}
        </div>
      </div>
  );
};

export default GameHeader;