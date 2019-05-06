import { alienFSMStates } from './alienActions';
import { playerCapsuleFSMStates } from './playerActions';

const _alienFSMStates = alienFSMStates();

const processMissileUpdate = (missileObj) => {
  missileObj.coordinates.x += missileObj.velocity.x;
  missileObj.coordinates.y += missileObj.velocity.y;  
  if (!missileObj.isOnScreen()) {
    missileObj.disposable = true;
  }
  const currentCell = missileObj.engine.gameBoard.cellFromCoordinates(missileObj.coordinates);
  if (currentCell.length > 0) {
    const objectInCell = currentCell[0][0].gameObject;
    if (objectInCell && objectInCell.type && objectInCell.detectCollisions) {   // e.g. not just an empty/passive object
      missileObj.engine.eventSystem.dispatchEvent(objectInCell.id, {target: 'FSM', action: 'TRANSITION', state: _alienFSMStates.shot});
      missileObj.disposable = true;
    }  
  }
  return;
};

const onUpdateMissile = (missileObj) => {
  processMissileUpdate(missileObj);
};

const _playerCapsuleFSMStates = playerCapsuleFSMStates();

const processBombUpdate = (bombObj) => {
  bombObj.coordinates.x += bombObj.velocity.x;
  bombObj.coordinates.y += bombObj.velocity.y;  
  if (!bombObj.isOnScreen()) {
    bombObj.disposable = true;
  }
  const currentCell = bombObj.engine.gameBoard.cellFromCoordinates(bombObj.coordinates);
  if (currentCell.length > 0) {
    const objectInCell = currentCell[0][0].gameObject;
    if (objectInCell && objectInCell.type && objectInCell.isPlayer) {
      bombObj.engine.eventSystem.dispatchEvent(objectInCell.id, {target: 'FSM', action: 'TRANSITION', state: _playerCapsuleFSMStates.hit});
      bombObj.disposable = true;
    }
  }
  return;
};

const onUpdateBomb = (bombObj) => {
  processBombUpdate(bombObj);
};

export { 
  onUpdateMissile, 
  onUpdateBomb, 
  testMissileCollision 
}
