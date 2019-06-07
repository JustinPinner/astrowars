// player 

import { Keys } from 'eccentric-engine/Engine';
import { 
  onPlayerUpdate,
  playerCapsuleFSMStates, 
  playerBaseFSMStates, 
  playerBaseUpdate 
} from '../behaviour/playerActions';

export const playerCapsule = () => {
  return {
    type: 'playerCapsule',
    state: 'live',
    initialVelocity: {
      x: 0,
      y: 0
    },
    width: 55,
    height: 50,
    sprites: {
      playerCapsule: {
        sheet: {
          path: 'player-spritesheet.png',
          frameWidth: 55, 
          frameHeight: 50,
          rows: 1,
          columns: 5
        },	
        isDefault: true
      }
    },
    keys: {
      left: {
          keyCodes: [Keys.A, Keys.ARROWLEFT]
      },
      right: {
          keyCodes: [Keys.D, Keys.ARROWRIGHT]
      },
      thrust: {
          keyCodes: [Keys.W, Keys.ARROWUP]
      },
      fire: {
          keyCodes: [Keys.SPACE, Keys.ENTER],
          minInterval: 1000
      }
    },
    soundEffects: {
      'shoot': {
        id: 'playerShoot',
        type: 'sawtooth',
        frequency: 2800,
        volume: 1.0,
        duration: 80  
      },
      'die': {
        id: 'playerDie',
        type: 'sawtooth',
        frequency: 800,
        volume: 1.0,
        duration: 120  
      }
    },
    fsmStates: playerCapsuleFSMStates,
    update: onPlayerUpdate,
    startRow: 1,
    startColumn: 2
  };
}

export const playerBase = () => {
  return {
    type: 'playerBase',
    state: 'live',
    initialVelocity: {
      x: 0,
      y: 0
    },
    width: 55,
    height: 50,
    sprites: {
      playerBase: {
        sheet: {
          path: 'player-base.png',
          frameWidth: 55, 
          frameHeight: 50,
          rows: 1,
          columns: 1,
        },	
        isDefault: true
      }
    },
    fsmStates: playerBaseFSMStates,
    update: playerBaseUpdate,
    startRow: 0,
    startColumn: 2
  };
};

export const playerTypes = {
    base: playerBase(),
    capsule: playerCapsule()
};

