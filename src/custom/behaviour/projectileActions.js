import { alienFSMStates } from "./alienActions";

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
    if (objectInCell && objectInCell.type) {   // e.g. not just an empty object ({})
      missileObj.engine.eventSystem.dispatchEvent(objectInCell.id, {target: 'FSM', action: 'TRANSITION', state: _alienFSMStates.shot});
      missileObj.disposable = true;
    }  
  }
  return;
};

const onUpdateMissile = (missileObj) => {
  processMissileUpdate(missileObj);
};

const processBombUpdate = (bombObj) => {
  bombObj.coordinates.x += bombObj.velocity.x;
  bombObj.coordinates.y += bombObj.velocity.y;  
  if (!bombObj.isOnScreen()) {
    bombObj.disposable = true;
  }
  const currentCell = bombObj.engine.gameBoard.cellFromCoordinates(bombObj.coordinates);
  if (currentCell.length > 0) {
    const objectInCell = currentCell[0][0].gameObject;
    if (objectInCell && objectInCell.type && objectInCell.type == 'player') {   // e.g. not just an empty object ({})
      // TODO: players don't have an FSM - need to send them a die now message instead  
      // bombObj.engine.eventSystem.dispatchEvent(objectInCell.id, {target: 'FSM', action: 'TRANSITION', state: _alienFSMStates.shot});
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
