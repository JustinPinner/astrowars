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
  let hit;  // only hit one thing at a time
  for (let c = 0; c < currentCell.length; c += 1) {
    for (let o = 0; o < currentCell[c][0].contents.length; o += 1) {
      const objectInCell = currentCell[c][0].contents[o];
      if (objectInCell && objectInCell.type && objectInCell.detectCollisions) {   // e.g. not just an empty/passive object
        missileObj.engine.eventSystem.dispatchEvent(objectInCell.id, {target: 'FSM', action: 'TRANSITION', state: _alienFSMStates.shot});
        missileObj.disposable = true;
        hit = true;
      }
      if (hit) break;  
    }
    if (hit) break;
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
  let hit;  // only hit one thing at a time
  for (let c = 0; c < currentCell.length; c += 1) {
    for (let o = 0; o < currentCell[c][0].contents.length; o += 1) {
      const objectInCell = currentCell[c][0].contents[o];
      if (objectInCell && objectInCell.type && objectInCell.isPlayer) {
        bombObj.engine.eventSystem.dispatchEvent(objectInCell.id, {target: 'FSM', action: 'TRANSITION', state: _playerCapsuleFSMStates.hit});
        bombObj.disposable = true;
        hit = true;
      }
      if (hit) break;
    }
    if (hit) break;
  }
  return;
};

const onUpdateBomb = (bombObj) => {
  processBombUpdate(bombObj);
};

export { 
  onUpdateMissile, 
  onUpdateBomb
}
