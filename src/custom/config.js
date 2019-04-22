
import {
  PlayerCapsule,
  PlayerBase
} from './model/players';
import {
  Alien
} from './model/aliens';
import { 
  Keys 
} from '../js/ui/keys';
import { 
  onPlayerUpdate,
  playerCapsuleFSMStates, 
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
  AlienBomb 
} from './model/projectiles';

const alienTypes = {
  commandShip: 'commandShip',
  warship: 'warship',
  fighter: 'fighter'
};

const _phases = () => {
  return {
    1: {
      name: 'firstWave',
      commandShips: 0,
      aliens: 30
    },
    2: {
      name: 'commandShips',
      commandShips: 3,
      aliens: 0
    },
    3: {
      name: 'dockingBonus',
      maxBonus: 1000
    }
  }
};

const _scoreDigitConfig = () => {
  return {
    type: 'scoreDigit',
    width: 55,
    height: 50,
    sprites: {
      digits: {
        sheet: {
          path: 'scoresheet.png',
          frameWidth: 62, 
          frameHeight: 85,
          rows: 1,
          columns: 10
        },	
        isDefault: true
      }
    },
    update: () => {}   
  }
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
    update: playerBaseUpdate,
    startRow: 0,
    startColumn: 2
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
      bombs: AlienBomb.type
    },
    phases: _phases,
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
    },
    playerPoints: 0,
    eventListener: (engine, evt) => {
      if (evt && evt.action) {
        switch (evt.action) {
          case 'ADDPLAYERPOINTS': 
            engine.config.game.playerPoints = engine.config.game.playerPoints ? engine.config.game.playerPoints += evt.value : evt.value ;
            const score = engine.config.game.playerPoints.toString().padStart(5, '0');
            for (let c = 0; c < engine.gameBoard.columns; c += 1) {
              engine.gameBoard.board[10][c].gameObject.value = Number(score.substr(c, 1));
            }
            break;

          case 'PLAYERHIT':
            for (const obj in engine.objects) {
              const gameObject = engine.objects[obj];
              if (gameObject.isAlien && gameObject.fsm) {
                gameObject.fsm.pushState();
                gameObject.fsm.transition(gameObject.fsm.states.pause);
              }
              if (gameObject.isPlayer && gameObject.fsm) {
                gameObject.fsm.transition(gameObject.fsm.states.flash);
              }
              if (gameObject.isProjectile) {
                gameObject.disposable = true;
              }
            }
            break;

          case 'ALIENDEATH':
            if (engine.spawnedAliens && engine.spawnedAliens < engine.config.phases()[engine.phase].aliens) {
              // spawn a new warship object
              const conf = engine.config.warship;
              let row = Math.floor((engine.gameBoard.rows - 4) + (Math.random() * 2));
              let col = Math.floor(Math.random() * engine.gameBoard.columns);
              // test if this [row][col] position is already occupied by a game object
              while(engine.gameBoard.board[row][col].gameObject.id) {
                row = Math.floor((engine.gameBoard.rows - 5) + (Math.random() * 2));
                col = Math.floor(Math.random() * engine.gameBoard.columns);
              }
              conf.width = engine.gameBoard.board[row][col].width;
              conf.height = engine.gameBoard.board[row][col].height;
              conf.fsmStates.default = conf.fsmStates['hover'];
              const spawnPos = {
                x: engine.gameBoard.board[row][col].x,
                y: engine.gameBoard.board[row][col].y
              };
              engine.gameBoard.board[row][col].gameObject = new Alien(conf, spawnPos, engine);          
            }
            break;

          case 'PLAYERRESPAWN':
            // TODO!
            for (const obj in engine.objects) {
              const gameObject = engine.objects[obj];
              if (gameObject.isPlayer) {
                const currentCell = gameObject.currentCell;
                if (currentCell.row != gameObject.conf.startRow || currentCell.column != gameObject.conf.startColumn) {
                  // reset row/column
                  engine.gameBoard.board[gameObject.currentCell.row][gameObject.currentCell.column].gameObject = {};
                  engine.gameBoard.board[gameObject.conf.startRow][gameObject.conf.startColumn].gameObject = gameObject;
                  gameObject.coordinates.x = engine.gameBoard.board[gameObject.conf.startRow][gameObject.conf.startColumn].x;
                  gameObject.coordinates.y = engine.gameBoard.board[gameObject.conf.startRow][gameObject.conf.startColumn].y;
                }
                gameObject.canDraw = true;
                engine.eventSystem.dispatchEvent(gameObject.id, {target: 'FSM', action: 'SET', state: gameObject.fsm.states.live});
                if (gameObject.isPlayerCapsule) {
                  engine.eventSystem.dispatchEvent(engine.id, {action: 'RESUMEPLAY'});
                } 
              }             
            }
            break;
          
          case 'RESUMEPLAY':
            for (const obj in engine.objects) {
              const gameObject = engine.objects[obj];
              if (gameObject.fsm && gameObject.fsm.savedState) {
                gameObject.fsm.popState();
              }
            }
            break;

          case 'PLAYSOUND':
            if (evt && evt.value) {
              engine.audioSystem.playEffect(evt.value.id);
            }
        }
      }
      
      if (evt && evt.callback) {
        if (evt.callbackArgs) {
          evt.callback(evt.callbackArgs);
        } else {
          evt.callback();
        }
      }
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
    };
  };
  get scoreDigit() {
    return _scoreDigitConfig();
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
  get phases() {
    return this._game.phases;
  };
}

CustomConfig.prototype.phase = function(phaseNumber) {
  return this.phases[phaseNumber];
}

export {
  CustomConfig
};
