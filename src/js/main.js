// main game definition and loop

import { Engine } from 'eccentric-engine/Engine';
import { Config } from './config/config';
import { initDemoMode } from './behaviour/gameActions';
import '../css/game.css';

const customLifecycle = {
  onSetup: (gameEngine) => {
    // write your custom setup code here - runs after gameEngine's default setup
    initDemoMode(gameEngine);
    // also, pre-load any heavy custom images here - e.g.;
    // gameEngine.imageService.load('path/to/large/image');
  }, 
  onStart: (gameEngine) => {
    // write custom startup code here
  }, 
  onTick: (gameEngine) => {
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
  }
};

const game = new Engine(Config, customLifecycle);

(function() {
  game.start();
})();
