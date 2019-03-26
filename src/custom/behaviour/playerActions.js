
const timing = {};

const onPlayerUpdate = (playerObj) => {
  processPlayerInputs(playerObj);
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

export { onPlayerUpdate };
