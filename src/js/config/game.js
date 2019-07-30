// gameConfig

import { phase } from './phase';
import {
  showScore,
  // gameStart,
  runInterstitial,
  spawnWarships,
  nextPhase,
  initDemoMode
} from '../behaviour/gameActions';
import { processor as keyProcessor } from '../ui/keyProcessor';

export const game = () => {
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
    phases: phase,
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
    eventListener: (engine, evt) => {      
      if (evt && evt.action) {
        switch (evt.action) {
          case 'HOLD':
            if (!isNaN(evt.value) && evt.onTimeUp) {
              engine.timers.pauseAll();
              engine.timers.add('HOLD', evt.value, null, evt.onTimeUp, engine);
              engine.timers.start('HOLD'); 
            }
            break;

          case 'ADDPLAYERPOINTS': 
            engine.playerPoints = engine.playerPoints ? engine.playerPoints += evt.value : evt.value ;
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
            const phase = engine.config.phases(engine.currentPhase);
            switch (evt.value) {
              case 'warship':
                if (engine.spawnedWarships && engine.spawnedWarships < phase.alienTotal('warship')) {
                  // spawn a new warship
                  spawnWarships(engine, 1);
                }
                break;
              case 'commandShip':
                if (engine.spawnedCommandShips && engine.spawnedCommandShips < phase.alienTotal('commandShip')) {
                  // spawn a new commandship
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
                  engine.eventSystem.dispatchEvent(engine.id, {action: 'RESUMEOBJECTS'});
                } 
              }             
            }
            break;

          case 'PAUSEOBJECTS':
            for (const obj in engine.objects) {
              const gameObject = engine.objects[obj];
              if (gameObject.fsm) {
                gameObject.fsm.pushState();
                engine.eventSystem.dispatchEvent(gameObject.id, {target: 'FSM', action: 'SET', state: gameObject.fsm.states.pause});
              }
            }
            break;  

          case 'RESUMEOBJECTS':
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
            switch (engine.currentPhase) {
              case 1:
              case 2:
                if (!engine.getObjectsByType('warship')) {
                  engine.eventSystem.dispatchEvent(engine.id, {action: 'ENDCURRENTPHASE'});
                }  
                break;
              case 3:
                if (!engine.getObjectsByType('commandShip')) {
                  engine.eventSystem.dispatchEvent(engine.id, {action: 'ENDCURRENTPHASE'});
                }  
                break;
              case 4:
                // if counter/bonus = 0, or capsule crashed, or docked, phase is complete
                let isComplete = false;
                const playerCapsule = engine.playerCapsule;
                const playerBase = engine.playerBase;
                if (playerCapsule && playerCapsule.fsm) {
                  switch (playerCapsule.fsm.currentState) {
                    case playerCapsule.fsm.states.docked || playerCapsule.fsm.states.crashed:
                      isComplete = true;
                      break;
                  }
                }
                if (!isComplete && (playerBase && playerBase.fsm)) {
                  switch(playerBase.fsm.currentState) {
                    case playerBase.fsm.states.docked || playerBase.fsm.states.crashed:
                      isComplete = true;
                      break;
                  }
                }
                if (isComplete) {
                  engine.eventSystem.dispatchEvent(engine.id, {action: 'ENDCURRENTPHASE'});
                }  
                break;
            }
            break;

          case 'ENDCURRENTPHASE':
            if (engine.config.game.phases(engine.currentPhase).interstitialAtEnd) {
              runInterstitial(engine);
            } else {
              nextPhase(engine);
            }
            break;

          case 'BEGINNEXTPHASE':
            engine.timers.cancel('HOLD');
            nextPhase(engine);
            engine.timers.startAll();
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
            engine.eventSystem.dispatchEvent(
              engine.id, 
              {
                action: 'HOLD', 
                value: 5000, 
                onTimeUp: (engine) => {
                  initDemoMode(engine);
                }
              }
            );
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
