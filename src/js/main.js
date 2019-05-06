// main game definition and loop

import Engine from './engine/engine';
import { GameBoard } from '../custom/model/gameBoard';
import { CustomConfig } from '../custom/config';
import {
  PlayerCapsule, 
  PlayerBase 
} from '../custom/model/players';
import {
  ScoreDigit
} from '../custom/model/score';
import { Alien } from '../custom/model/aliens';
import '../css/game.css';
import { 
  initDemoMode 
} from '../custom/behaviour/gameActions';

const onSetup = (gameEngine) => {
  // write your custom setup code here - runs after gameEngine's default setup
  initDemoMode(gameEngine);

  // also, pre-load any heavy custom images here - e.g.;
  // gameEngine.imageService.load('path/to/large/image');
};

const onStart = (gameEngine) => {
  // write custom startup code here
};

const onTick = (gameEngine) => {
  // write custom global game state update code here - your code runs after Engine's tick function completes
  // only do this once per second
  const phaseCheckId = 'CHECKPHASECOMPLETE';
  if (gameEngine.timing[phaseCheckId]) {
    const lastTime = gameEngine.timing[phaseCheckId].last;
    if (Date.now() - lastTime >= 1000) {
      gameEngine.timerStop(phaseCheckId);
      gameEngine.eventSystem.dispatchEvent(gameEngine.id, { action: phaseCheckId });
      gameEngine.timerStart(phaseCheckId);
      }  
  } else {
    gameEngine.eventSystem.dispatchEvent(gameEngine.id, { action: phaseCheckId });
    gameEngine.timerStart(phaseCheckId);
  }  
};

const customLifecycle = {
  onSetup: onSetup, 
  onStart: onStart, 
  onTick: onTick
};

const game = new Engine(CustomConfig, customLifecycle);

(function() {
  game.start();
})();
