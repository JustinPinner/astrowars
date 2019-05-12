
import {
  showScore,
  gameStart,
  spawnWarships,
  nextPhase
} from './behaviour/gameActions';
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
  digitFSMStates
} from './model/score';
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

const _phases = (phase) => {
  switch (phase) {
    case 0: 
      return {
        name: 'demo',
        alienTotal: (alienType) => {
          return (alienType == 'warship') ? 4 : 3;
        },
        alienConcurrent: (alienType) => {
          return (alienType == 'warship') ? 4 : 3;
        },
        alienState: (alienType) => {
          const states = alienFSMStates();
          return (alienType == 'warship') ? states.strafe : states.idle;
        }
      };
    case 1:
      return {
        name: 'assault',
        alienTotal: (alienType) => {
          return (alienType == 'warship') ? 30 : 3;
        },
        alienConcurrent: (alienType) => {
          return (alienType == 'warship') ? 5 : 3;
        },
        alienState: (alienType) => {
          const states = alienFSMStates();
          return (alienType == 'warship') ? states.hover : states.idle;
        }
      };
    case 2:
      return {
        name: 'dive',
        alienTotal: (alienType) => {
          return (alienType == 'warship') ? 15 : 0;
        },
        alienConcurrent: (alienType) => {
          return (alienType == 'warship') ? 1 : 0;
        },
        alienState: (alienType) => {
          const states = alienFSMStates();
          return (alienType == 'warship') ? states.zigZagDive : states.idle;
        }
      };
    case 3:
      return {
        name: 'command',
        alienTotal: (alienType) => {
          return (alienType == 'commandShip') ? 3 : 0;
        },
        alienConcurrent: (alienType) => {
          return (alienType == 'commandShip') ? 3 : 0;
        },
        alienState: (alienType) => {
          const states = alienFSMStates();
          return (alienType == 'commandShip') ? states.strafe : states.idle;
        }
      };
    case 4: 
      return {
        name: 'bonus',
        alienTotal: () => {
          return 0;
        },
        alienConcurrent: () => {
          return 0;
        }
      };
  }
};

const _digitConfig = () => {
  return {
    type: 'digit',
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
    fsmStates: digitFSMStates,
    update: (digit) => {
      digit.fsm && digit.fsm.execute();
    }  
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
    gameBoardRows: 11,
    gameBoardColumns: 5,
    phase: 0,
    level: 1,
    playerPoints: 20,
    playerLives: 5,
    spawnedCommandShips: 0,
    spawnedWarships: 0,
    eventListener: (engine, evt) => {      
      if (evt && evt.action) {
        switch (evt.action) {
          case 'STARTGAME':
            gameStart(engine);
            break;

          case 'ADDPLAYERPOINTS': 
            engine.config.game.playerPoints = engine.config.game.playerPoints ? engine.config.game.playerPoints += evt.value : evt.value ;
            showScore(engine);
            break;

          case 'PLAYERBOMBED':
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
            engine.config.game.playerLives -= 1; 
            break;

          case 'PLAYEROVERRUN':
            if (!evt.source || !evt.target) {
              console.log('Error in PLAYEROVERRUN: missing event source and/or target objects');
              return;
            }
            const alien = evt.source;
            const player = evt.target;
            const playerBase = engine.getObjectByType('playerBase');

            for (const obj in engine.objects) {
              const gameObject = engine.objects[obj];
              if (gameObject.isAlien && gameObject.fsm && gameObject.id !== alien.id) {                
                gameObject.fsm.pushState();
                gameObject.fsm.transition(gameObject.fsm.states.pause);  
              }
              if (gameObject.isProjectile) {
                gameObject.disposable = true;
              }
            }            
            alien.fsm.transition(alien.fsm.states.flash);
            player.fsm.transition(player.fsm.states.flash);
            playerBase && playerBase.fsm.transition(playerBase.fsm.states.flash);
            break;

          case 'ALIENDEATH':
            const phase = engine.config.phases(engine.config.game.phase);
            switch (evt.value) {
              case 'warship':
                if (engine.config.game.spawnedWarships && engine.config.game.spawnedWarships < phase.alienTotal('warship')) {
                  // spawn a new warship object
                  spawnWarships(engine, 1);
                }
                break;
              case 'commandShip':
                if (engine.config.game.spawnedCommandShips && engine.config.game.spawnedCommandShips < phase.alienTotal('commandShip')) {
                  // spawn a new warship object
                  spawnCommandShips(engine, 1);
                }
                break;
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
                  currentCell.removeObject(gameObject);
                  // engine.gameBoard.board[gameObject.currentCell.row][gameObject.currentCell.column].gameObject = {};
                  const startCell = engine.gameBoard.board[gameObject.conf.startRow][gameObject.conf.startColumn];
                  startCell.clearObjects();
                  startCell.addObject(gameObject);
                  gameObject.coordinates.x = startCell.x;
                  gameObject.coordinates.y = startCell.y;
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
            break;

          case 'CHECKPHASECOMPLETE':
            switch (engine.config.game.phase) {
              case (1 || 2):
                if (!engine.getObjectsByType('warship')) {
                  nextPhase(engine);
                }  
                break;
              case 3:
                if (!engine.getObjectsByType('commandShip')) {
                  nextPhase(engine);
                }  
                break;
            }
            break;

          case 'GAMEOVER':
            for (const obj in engine.objects) {
              const gameObject = engine.objects[obj];
              if (gameObject.isPlayer || gameObject.isAlien || gameObject.isProjectile) {
                gameObject.disposable = true;
              }
              if (gameObject.isDigit) {
                gameObject.fsm.transition(gameObject.fsm.states.flash);
              }
            }
            break;          
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
  get digit() {
    return _digitConfig();
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
