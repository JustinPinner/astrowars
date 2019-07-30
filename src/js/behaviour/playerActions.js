import {
  horizontalMove,
  verticalMove
} from '../model/cellBasedMovement';
import {
  showBonus
} from './gameActions';

const timing = {};

const stateNames = {
  baseFollow: 'baseFollow',
  baseStartScroll: 'baseStartScroll',
  baseScrolling: 'baseScrolling',
  baseDocked: 'baseDocked', 
  baseCrashed: 'baseCrashed',
  playerBombed: 'playerBombed',
  dockingSuccess: 'dockingComplete',
  dockingFailed: 'dockingFailed',
  capsuleLive: 'capsuleLive',
  capsuleHit: 'capsuleHit',
  playerDie: 'die',
  playerFlash: 'playerFlash',
  capsuleLaunch: 'capsuleLaunch',
  capsuleDescent: 'capsuleDescent', 
  capsuleDocked: 'capsuleDocked', 
  capsuleCrashed: 'capsuleCrashed',
  capsuleAscent: 'capsuleAscent'
};

const baseFollowState = {
  name: stateNames.baseFollow,
  nextStates: [stateNames.playerBombed, stateNames.baseStartScroll],
  detectCollisions: true,
  execute: (playerBase) => {
		const playerCapsule = playerBase.engine.getObjectByType('playerCapsule');
		if (playerCapsule && playerCapsule.currentCell && playerCapsule.currentCell.column != playerBase.currentCell.column) {
			if (playerCapsule.currentCell.column < playerBase.currentCell.column) {
				playerBase.moveLeft();
			} else {
				playerBase.moveRight();
			}
		}
  }
};

const baseStartScrollState = {
  name: 'baseStartScroll',
  nextStates: [stateNames.baseScrolling],
  detectCollisions: true,
  execute: (playerBase) => {
    // enable vertical screen wrap
    const canWrap = {
      horizontal: true,
      vertical: false
    };
    playerBase.engine.timers.add('BASESCROLL', null, 500, playerBase.moveRight.bind(playerBase), canWrap);
    playerBase.engine.timers.start('BASESCROLL');
    playerBase.fsm.transition(playerBase.fsm.states.scrolling);
  }
};

const baseScrollingState = {
  name: 'baseScrolling',
  nextStates: [stateNames.baseDocked, stateNames.baseCrashed],
  detectCollisions: true,
  execute: (playerBase) => {
    // do nothing - the timer created in baseStartScrollState will execute the moveRight code for us
  }
};

const baseDockedState = {
  name: stateNames.baseDocked,
  nextStates: [stateNames.baseFollow],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerBase) => {
    playerBase.engine.playerPoints += playerBase.engine.playerBonus;
    playerBase.fsm.transition(playerBase.fsm.states.follow);
  }
};

const baseCrashedState = {
  name: stateNames.baseCrashed,
  nextStates: [stateNames.baseFollow],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerBase) => {
    // TODO:
    // Show bonus score
    // Show total score
    // Switch base to follow mode
    // Switch capsule to live mode
    // Begin next phase
  }
};

const playerFlashState = {
  name: stateNames.playerFlash,
  nextStates: [stateNames.playerDie],
  detectCollisions: false,
  processPlayerInputs: false,
  minimumExecutionInterval: 300,
  minimumStateDuration: 2000,
  force: true,
  execute: (player) => {
    if ((player.fsm.currentState.minimumStateDuration || 0) <= player.fsm.lastExecutionTime - player.fsm.startTime) {
      // we've done our time, transition to next state
      player.fsm.transition(player.fsm.states[stateNames.playerDie]);
    }
    // invert drawable state
    player.canDraw = !player.canDraw;
  }
};

const playerDieState = {
  name: stateNames.playerDie,
  nextStates: [stateNames.playerFlash],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (player) => {
    // re-spawn (if there are sufficient lives remaining)
    if (player.engine.playerLives > 1) {
      player.engine.playerLives -= 1;
      player.engine.eventSystem.dispatchEvent(player.engine.id, {action: 'PLAYERRESPAWN'});    
    } else {
      player.engine.eventSystem.dispatchEvent(player.engine.id, {action: 'GAMEOVER'});    
    }
  }
};

const playerBaseFSMStates = {
  follow: baseFollowState,
  scrollStart: baseStartScrollState,
  scrolling: baseScrollingState,
  flash: playerFlashState,
  die: playerDieState,
  docked: baseDockedState,
  crashed: baseCrashedState,
  default: baseFollowState
};

const capsuleLiveState = {
  name: stateNames.capsuleLive,
  nextStates: [stateNames.capsuleHit, stateNames.capsuleLaunch],
  detectCollisions: true,
  processPlayerInputs: true,
  execute: (playerCapsule) => {
    // TODO:
    // process player inputs
  }
};

const capsuleRespawnState = {
  name: stateNames.capsuleRespawn,
  nextStates: [stateNames.capsuleLive],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerCapsule) => {
    // TODO:
    // move capsule to centre column
    playerCapsule.engine.playerLives -= 1;
    // transition to live state
    playerCapsule.fsm.transition(capsuleLiveState);
  }
};

const capsuleHitState = {
  name: stateNames.capsuleHit,
  nextStates: [stateNames.playerDie],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerCapsule) => {
    // TODO:
    const engine = playerCapsule.engine;
    engine.eventSystem.dispatchEvent(engine.id, {action: 'PLAYSOUND', value: (playerCapsule.conf.soundEffects ? playerCapsule.conf.soundEffects['die'] : engine.defaultSoundEffects['die'])});
    engine.eventSystem.dispatchEvent(engine.id, {action: "PLAYERBOMBED"});
    // transition to flash state
    playerCapsule.fsm.transition(playerCapsule.fsm.states.flash);
  }
};

const capsuleLaunchState = {
  name: stateNames.capsuleLaunch,
  nextStates: [stateNames.capsuleAscent],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerCapsule) => {
    // Set bonus points to maximum
    // Launch capsule
    if (playerCapsule.canMoveVertically(verticalMove.up)) {
      playerCapsule.engine.timers.add('CAPSULEASCENT', null, 1000, playerCapsule.moveUp.bind(playerCapsule));
      playerCapsule.engine.timers.start('CAPSULEASCENT');
      playerCapsule.fsm.transition(playerCapsule.fsm.states.ascent);
    }
  }
};

const capsuleAscentState = {
  name: stateNames.capsuleAscent,
  nextStates: [stateNames.capsuleDescent],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerCapsule) => {
    if (playerCapsule.currentCell.row < playerCapsule.engine.gameBoard.rows - 2) {
      return;
    }
    const playerBase = playerCapsule.engine.playerBase;
    playerCapsule.engine.timers.cancel('CAPSULEASCENT');
    playerCapsule.engine.timers.add('CAPSULEDESCENT', null, 2000, playerCapsule.moveDown.bind(playerCapsule));
    playerCapsule.engine.timers.start('CAPSULEDESCENT');
    playerCapsule.engine.playerBonus = 5000;
    showBonus(playerCapsule.engine);
    playerBase.fsm.transition(playerBase.fsm.states.scrollStart);
    playerCapsule.fsm.transition(playerCapsule.fsm.states.descent);
  }
};

const capsuleDescentState = {
  name: stateNames.capsuleDescent,
  nextStates: [stateNames.capsuleDocked, stateNames.capsuleCrashed],
  detectCollisions: true,
  processPlayerInputs: true,
  execute: (playerCapsule) => {
    const playerBase = playerCapsule.engine.playerBase;
    // decrement bonus points
    playerCapsule.engine.playerBonus -= 1;
    showBonus(playerCapsule.engine);
    if (playerCapsule.engine.playerBonus < 1) {
      playerCapsule.engine.timers.cancel('CAPSULEDESCENT');
      playerCapsule.engine.timers.cancel('BASESCROLL');
      // transition to crashed state
      playerCapsule.fsm.transition(playerCapsule.fsm.states.crashed);
      playerBase.fsm.transition(playerBase.fsm.states.crashed);
    } else if (playerCapsule.currentCell.row <= 1) {
      playerCapsule.engine.timers.cancel('CAPSULEDESCENT');
      playerCapsule.engine.timers.cancel('BASESCROLL');
      if (playerBase.currentCell.column == playerBase.currentCell.column) {
        // transition to docked state
        playerCapsule.fsm.transition(playerCapsule.fsm.states.docked);
        playerBase.fsm.transition(playerBase.fsm.states.docked);
      } else {
        // transition to crashed state
        playerCapsule.engine.playerBonus = 0;
        playerCapsule.fsm.transition(playerCapsule.fsm.states.crashed);
        playerBase.fsm.transition(playerBase.fsm.states.crashed);
      }
    }
  }
};

const capsuleDockedState = {
  name: stateNames.capsuleDocked,
  nextStates: [],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerCapsule) => {
    // Bonus points (if any) are added to the score by the base when it enters docked state
  }
};

const capsuleCrashedState = {
  name: stateNames.capsuleCrashed,
  nextStates: [stateNames.capsuleLive],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerCapsule) => {
    // TODO:
    // Show bonus score
    // Show total score
    // Switch base to follow mode
    // Switch capsule to live mode
    // Begin next phase
  }
};

const playerCapsuleFSMStates = () => {
  return {
    default: capsuleLiveState,
    live: capsuleLiveState,
    launch: capsuleLaunchState,
    descent: capsuleDescentState,
    docked: capsuleDockedState,
    crashed: capsuleCrashedState,
    die: playerDieState,
    respawn: capsuleRespawnState,
    hit: capsuleHitState,
    flash: playerFlashState,
    ascent: capsuleAscentState  
  };
};

const onPlayerUpdate = (playerObj) => {
  if (playerObj.fsm) {
    playerObj.fsm.execute();
  }
  processPlayerInputs(playerObj);
	playerObj.updatePosition();
};

const playerBaseUpdate = (playerBaseObject) => {
  if (playerBaseObject.fsm) {
    playerBaseObject.fsm.execute();
    return;
  }
};

const inputTimeoutElapsed = () => {
  const now = Date.now();
  const lastTime = (timing.moveToColumn && timing.moveToColumn.last) ? timing.moveToColumn.last : now;
  const duration = now - lastTime;
  if (duration > 0 && duration < 200) {
    return false;
  }
  timing.moveToColumn = {
    last: now,
    duration: duration
  };
  return true;
};

const processPlayerInputs = (playerObj) => {
  if (!playerObj.fsm.currentState.processPlayerInputs) {
    return;
  }
  
  if (playerObj.engine.gamepad) {
		const status = playerObj.engine.gamepad.status;
		const buttons = playerObj.engine.gamepad.buttons;
		const sticks = playerObj.engine.gamepad.sticks;
		const triggers = playerObj.engine.gamepad.triggers;
		if (buttons.start) {
			debugger;
		}
		if (sticks.left.left && inputTimeoutElapsed() && playerObj.canMoveHorizontally(horizontalMove.left)) {
      playerObj.moveLeft();
    }
		if (sticks.left.right && inputTimeoutElapsed() && playerObj.canMoveHorizontally(horizontalMove.right)) {
      playerObj.moveRight();
		}
		if (buttons.a) {
      if (playerObj.state == 'landing') {
        playerObj.thrust();
      } else {
        playerObj.shoot();
      }
		}
	}
	
  if (playerObj.engine.keyHandler.pressed.left && inputTimeoutElapsed() && playerObj.canMoveHorizontally(horizontalMove.left)) {
    playerObj.moveLeft();
  } else if (playerObj.engine.keyHandler.pressed.right && inputTimeoutElapsed() && playerObj.canMoveHorizontally(horizontalMove.right)) {
    playerObj.moveRight();
  }
  
  if (playerObj.engine.keyHandler.pressed.enter) {
    if (playerObj.fsm && playerObj.fsm.currentState && playerObj.fsm.currentState == playerObj.fsm.states.capsuleDescent) {
      playerObj.thrust();
    } else {
      playerObj.shoot();
    }
  }
	
};

export { 
  onPlayerUpdate,
  playerCapsuleFSMStates,
  playerBaseFSMStates,
  playerBaseUpdate
};
