
import {
  PlayerCapsule,
  PlayerBase
} from './model/players';
import { 
  Keys 
} from '../js/ui/keys';
import { 
  onPlayerUpdate, 
  playerBaseFSMStates, 
  playerBaseUpdate 
} from './behaviour/playerActions';
import { 
  processor as keyProcessor 
} from './keyProcessor';
import { 
  alienUpdate,
  alienFSMStates 
} from './behaviour/alienActions';
import { 
  PlayerMissile, 
  alienBomb 
} from './model/projectiles';

const alienTypes = {
  commandShip: 'commandShip',
  warship: 'warship',
  fighter: 'fighter'
};

const _playerCapsuleConfig = () => {
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
    update: onPlayerUpdate
  };
}

const _playerBaseConfig = () => {
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
    update: playerBaseUpdate
  };
};

const _alienConfig = () => {
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
      }
    },
    fsmStates: alienFSMStates(),
    update: alienUpdate
  }
};

const _gameConfig = () => {
  return {
    version: 0.1,
    fps: 30,
    canvasses: {
      background: {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        wrapper: {
          selector: '#bgdiv',
          style: {
            backgroundColour: '#000000',
          }
        },
        canvas: {
          selector: '#bgcanvas'
        },
        alias: 'background'
      },
      midground: {
        x: ((window.innerWidth / 2) - (800 / 2)),
        y: 0,
        width: 800,
        height: window.innerHeight,
        wrapper: {
          selector: '#mgdiv',
          style: {
            background: 'transparent'
          }
        },
        canvas: {
          selector: '#mgcanvas',
          image: 'nebulae.jpeg'
        },
        alias: 'midground'
      },
      foreground: {
        x: ((window.innerWidth / 2) - (300 / 2)),
        y: 0,
        width: 300,
        height: window.innerHeight,
        wrapper: {
          selector: '#fgdiv',
          style: {
            background: 'rgba(0,0,0,0.8)'
          }
        },
        canvas: {
          selector: '#fgcanvas'
        },
        alias: 'viewport'
      }
    },
    objectTypes: {
      players: PlayerCapsule.type,
      aliens: _alienConfig,
      missiles: PlayerMissile.type,
      bombs: alienBomb
    },
    enableTouchUI: 'auto',
    touchUI: {
      x: ((window.innerWidth / 2) - (300 / 2)),
      y: 0,
      width: 300,
      height: 900,
      selector: 'touchUI',
    },
    enableKeyboardUI: true,
    keyProcessor: keyProcessor,
    enableGamepadUI: true,
    lifeCycle: {
      // onSetup: onSetup,
      // onStart: onStart,
      // onTick: onTick
    }  
  };
};

class CustomConfig {
  constructor(customLifecycle) {
    this._game = _gameConfig();
    this._game.lifeCycle = {
      onSetup: customLifecycle.onSetup,
      onStart: customLifecycle.onStart,
      onTick: customLifecycle.onTick
    }
  };
  get game() {
    return this._game;
  };
  get playerCapsule() {
    return _playerCapsuleConfig();
  };
  get playerBase() {
    return _playerBaseConfig();
  };
  get commandShip() {
    const conf = _alienConfig();
    conf.type = alienTypes.commandShip;
    return conf;
  };
  get warship() {
    const conf = _alienConfig();
    conf.type = alienTypes.warship;
    return conf;
  };
  get fighter() {
    const conf = _alienConfig();
    conf.type = alienTypes.fighter;
    return conf;
  };
}

export {
  CustomConfig
};
