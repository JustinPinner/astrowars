import { alienCommonFSMStates } from "./alienActions";

const onUpdateMissile = (missileObj) => {
  processMissileUpdate(missileObj);
};

const onUpdateBomb = (bombObj) => {
  processBombUpdate(bombObj);
};

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
      missileObj.engine.eventSystem.dispatchEvent(objectInCell.id, {target: 'FSM', action: 'TRANSITION', state: alienCommonFSMStates.shot});
      missileObj.disposable = true;
    }  
  }
  return;
}

const processBombUpdate = (bombObj) => {
  // TODO
  return;
}

export { onUpdateMissile, onUpdateBomb, testMissileCollision };

