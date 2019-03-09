import { playerBase } from '../model/players';
import { playerMissile } from '../model/projectiles';

const timing = {};

const onPlayerUpdate = (playerObj) => {
  processPlayerInputs(playerObj);
};

const currentColumn = (playerObj) => {
  for (let col = 0; col < playerObj.gameBoardRow.length; col += 1) {
    if (playerObj.gameBoardRow[col].gameObject && playerObj.gameBoardRow[col].gameObject === playerObj) {
      return col;   
    }
  }
  return undefined;
};

const moveToColumn = (playerObj, newCol) => {
  const now = Date.now();
  const lastTime = (timing.moveToColumn && timing.moveToColumn.last) ? timing.moveToColumn.last : now;
  const duration = now - lastTime;
  if (duration > 0 && duration < 500) {
    return;
  }
  timing.moveToColumn = {
    last: now,
    duration: duration
  };

  const currentCol = currentColumn(playerObj);
  if (isNaN(currentCol)) {
    return;
  }
  if (newCol < 0 || newCol > playerObj.gameBoardRow.length - 1 || Math.abs(newCol - currentCol) > 1) {
    return;
  }
  playerObj.gameBoardRow[newCol].gameObject = playerObj;
  playerObj.gameBoardRow[currentCol].gameObject = {};
  playerObj.coordinates.x = playerObj.gameBoardRow[newCol].x;
  playerObj.coordinates.y = playerObj.gameBoardRow[newCol].y;

  const playerBaseObj = playerObj.engine.getObjectByType(playerBase.type);
  playerBaseObj.coordinates.x = playerObj.coordinates.x;
};

const shoot = (playerObj) => {
  // we can only fire one shot at a time
  const playerShot = playerObj.engine.getObjectByType('missile');
  if (!playerShot) {
    const launchPosition = {
      x: playerObj.coordinates.x + (playerObj.width / 2) - (playerMissile.width / 2), 
      y: playerObj.coordinates.y
    };
    playerObj.engine.createObject(playerMissile, launchPosition);
  }
};

const processPlayerInputs = (playerObj) => {
  const currentCol = currentColumn(playerObj);
  if (playerObj.engine.gamepad) {
		const status = playerObj.engine.gamepad.status;
		const buttons = playerObj.engine.gamepad.buttons;
		const sticks = playerObj.engine.gamepad.sticks;
		const triggers = playerObj.engine.gamepad.triggers;
		if (buttons.start) {
			debugger;
		}
		if (sticks.left.left) {
      //playerObj.setVelocity({x: -1});
      moveToColumn(playerObj, currentCol - 1);
		}
		if (sticks.left.right) {
      //playerObj.setVelocity({x: 1});
      moveToColumn(playerObj, currentCol + 1);
		}
		if (buttons.a) {
      if (playerObj.state == 'landing') {
        playerObj.thrust();
      } else {
        shoot(playerObj);
      }
		}
	}
	
  if (playerObj.engine.keyHandler.pressed.left) {
    moveToColumn(playerObj, currentCol - 1);
  } else if (playerObj.engine.keyHandler.pressed.right) {
    moveToColumn(playerObj, currentCol + 1);
  }
  if (playerObj.engine.keyHandler.pressed.enter) {
    if (playerObj.state == 'landing') {
      playerObj.thrust();
    } else {
      shoot(playerObj);
    }
  }
	
	playerObj.updatePosition();

};

export { onPlayerUpdate };
