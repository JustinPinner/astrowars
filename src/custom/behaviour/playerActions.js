
const timing = {};

const stateNames = {
  baseFollow: 'baseFollow',
  baseScroll: 'baseScroll',
  playerBombed: 'playerBombed',
  dockingSuccess: 'dockingComplete',
  dockingFailed: 'dockingFailed'
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

const playerBaseFSMStates = {
  follow: baseFollowState,
  scroll: baseScrollState,
  default: baseFollowState
};

const onPlayerUpdate = (playerObj) => {
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
  if (duration > 0 && duration < 500) {
    return false;
  }
  timing.moveToColumn = {
    last: now,
    duration: duration
  };
  return true;
};

const processPlayerInputs = (playerObj) => {
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
  playerBaseFSMStates,
  playerBaseUpdate
};
