// main game definition and loop

import { AWEngine } from './custom/engine';
import { Config } from './config/config';
import { initDemoMode } from './behaviour/gameActions';
import '../css/game.css';

const phaseCheckId = 'CHECKPHASECOMPLETE';

const customLifecycle = {
  onSetup: (gameEngine) => {
    // write your custom setup code here - runs after gameEngine's default setup
    initDemoMode(gameEngine);
    // also, pre-load any heavy custom images here - e.g.;
    // gameEngine.imageService.load('path/to/large/image');
  }, 
  onStart: (gameEngine) => {
    // write custom startup code here

    // check if player has completed the current phase - approx. once per second
    const phaseCompleteCheck = (engine) => {
      engine.eventSystem.dispatchEvent(engine.id, { action: phaseCheckId });
    };
    gameEngine.timers.add(phaseCheckId, null, 1000, phaseCompleteCheck, gameEngine);
    gameEngine.timers.start(phaseCheckId);
  }, 
  onTick: (gameEngine) => {
    // write custom global game state update code here - your code runs after Engine's tick function completes
  }
};

const game = new AWEngine(Config, customLifecycle);

(function() {
  game.start();
})();
