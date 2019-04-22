
const timing = {};

const stateNames = {
  baseFollow: 'baseFollow',
  baseScroll: 'baseScroll',
  playerBombed: 'playerBombed',
  dockingSuccess: 'dockingComplete',
  dockingFailed: 'dockingFailed',
  capsuleLive: 'capsuleLive',
  capsuleHit: 'capsuleHit',
  playerDie: 'die',
  playerFlash: 'playerFlash',
  capsuleLaunch: 'capsuleLaunch',
  capsuleDescent: 'capsuleDescent', 
  capsuleDock: 'capsuleDock', 
  capsuleCrash: 'capsuleCrash'
};

const baseFollowState = {
  name: stateNames.baseFollow,
  nextStates: [stateNames.playerBombed, stateNames.baseScroll],
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

const baseScrollState = {
  name: 'baseScroll',
  nextStates: [stateNames.dockingSuccess, stateNames.dockingFailed],
  detectCollisions: true,
  execute: (playerBase) => {
    // move left/right
    // drop bomb maybe
  }
};

const playerFlashState = {
  name: stateNames.playerFlash,
  nextStates: [stateNames.playerDie],
  detectCollisions: false,
  processPlayerInputs: false,
  minimumExecutionInterval: 500,
  minimumStateDuration: 3000,
  force: true,
  execute: (player) => {
    if ((player.fsm.currentState.minimumStateDuration || 0) <= player.fsm.lastExecutionTime - player.fsm.startTime) {
      // we've done our time, transition to next state
      player.fsm.transition(player.fsm.states[stateNames.playerDie]);
    }
    // invert drawable state
    player.canDraw = !player.canDraw;
  }
}

const playerDieState = {
  name: stateNames.playerDie,
  nextStates: [stateNames.playerFlash],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (player) => {
    // TODO:
    // re-spawn (if there are sufficient lives remaining)
    player.engine.eventSystem.dispatchEvent(player.engine.id, {action: 'PLAYERRESPAWN'});    
  }
};

const playerBaseFSMStates = {
  follow: baseFollowState,
  scroll: baseScrollState,
  flash: playerFlashState,
  die: playerDieState,
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
    // decrement remaining lives
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
    engine.eventSystem.dispatchEvent(engine.id, {action: "PLAYERHIT"});
    // transition to flash state
    playerCapsule.fsm.transition(playerCapsule.fsm.states.flash);
  }
};

const capsuleLaunchState = {
  name: stateNames.capsuleLaunch,
  nextStates: [stateNames.capsuleDescent],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerCapsule) => {
    // TODO:
    // Centre capsule and base
    // Launch capsule
    // Set bonus points to maximum
    // Switch to descent mode at apogee
  }
};

const capsuleDescentState = {
  name: stateNames.capsuleLaunch,
  nextStates: [stateNames.capsuleDock, stateNames.capsuleCrash],
  detectCollisions: true,
  processPlayerInputs: true,
  execute: (playerCapsule) => {
    // TODO:
    // Switch base to scroll mode
    // Enable capsule collision detection
    // Begin descent
    // Begin bonus points countdown
    // Switch to crash mode at bottom row
  }
};

const capsuleDockState = {
  name: stateNames.capsuleLaunch,
  nextStates: [stateNames.capsuleDock, stateNames.capsuleCrash],
  detectCollisions: false,
  processPlayerInputs: false,
  execute: (playerCapsule) => {
    // TODO:
    // Switch base to scroll mode
    // Enable capsule collision detection
    // Begin descent
    // Begin bonus points countdown
    // Switch to crash mode at bottom row
  }
};

const playerCapsuleFSMStates = () => {
  return {
    default: capsuleLiveState,
    live: capsuleLiveState,
    launch: capsuleLaunchState,
    descent: capsuleDescentState,
    dock: capsuleDockState,
    die: playerDieState,
    respawn: capsuleRespawnState,
    hit: capsuleHitState,
    flash: playerFlashState  
  };
}

const onPlayerUpdate = (playerObj) => {
  if (playerObj.fsm) {
    playerObj.fsm.execute();
  }
  processPlayerInputs(playerObj);
};

const playerBaseUpdate = (playerBaseObject) => {
  if (playerBaseObject.fsm) {
    playerBaseObject.fsm.execute();
    return;
  }
};

const canMove = () => {
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
		if (sticks.left.left && canMove()) {
      playerObj.moveLeft();
    }
		if (sticks.left.right && canMove()) {
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
	
  if (playerObj.engine.keyHandler.pressed.left && canMove()) {
    playerObj.moveLeft();
  } else if (playerObj.engine.keyHandler.pressed.right && canMove()) {
    playerObj.moveRight();
  }
  if (playerObj.engine.keyHandler.pressed.enter) {
    if (playerObj.state == 'landing') {
      playerObj.thrust();
    } else {
      playerObj.shoot();
    }
  }
	
	playerObj.updatePosition();

};

export { 
  onPlayerUpdate,
  playerCapsuleFSMStates,
  playerBaseFSMStates,
  playerBaseUpdate
};
