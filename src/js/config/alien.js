// alien

import { 
  alienUpdate,
  alienFSMStates 
} from '../behaviour/alienActions';

const alienTypes = {
  commandShip: 'commandShip',
  warship: 'warship',
  fighter: 'fighter'
};

export const alien = () => {
  return {
    type: undefined,
    state: undefined,
    initialVelocity: {
      x: 0,
      y: 0
    },
    width: 58,
    height: 50,
    sprites: {
      commandShip: {
        sheet: {
          path: 'alien-commandship.png',
          frameWidth: 56, 
          frameHeight: 50,
          rows: 1,
          columns: 1,
          fromRow: 9,
          toRow: 9 
        }  
      },
      warship: {
        sheet: {
          path: 'alien-hover-spritesheet.png',
          frameWidth: 58, 
          frameHeight: 50,
          rows: 1,
          columns: 2,
          fromRow: 7,
          toRow: 8 
        }  
      },
      fighter: {
        sheet: {
          path: 'alien-dive-spritesheet.png',
          frameWidth: 65, 
          frameHeight: 60,
          rows: 1,
          columns: 5,
          fromRow: 2,
          toRow: 6 
        }  
      },
      landedFighter: {
        sheet: {
          path: 'alien-landed-spritesheet.png',
          frameWidth: 58, 
          frameHeight: 50,
          rows: 1,
          columns: 2,
          fromRow: 1,
          toRow: 1 
        }          
      }
    },
    soundEffects: {
      'die': {
        id: 'alienDie',
        type: 'sawtooth',
        frequency: 3200,
        volume: 1.0,
        duration: 80  
      }
    },
    fsmStates: alienFSMStates(),
    update: alienUpdate
  }
};

export const commandShip = () => {
  const _alien = alien();
  _alien.type = alienTypes.commandShip;
  return _alien;
};

export const warship = () => {
  const _alien = alien();
  _alien.type = alienTypes.warship;
  return _alien;
};

export const fighter = () => {
  const _alien = alien();
  _alien.type = alienTypes.fighter;
  return _alien;
};
