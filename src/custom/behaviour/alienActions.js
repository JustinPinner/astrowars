// write alien behaviours here
// these functions will be bound into GameObject instances with .bind(this, this)
// so remember to change this.state if/when needed

import { alienCommandShipConf } from '../model/aliens';

const stateNames = {
  dying: 'dyingState',
  landed: 'landedState',
  zigZagClimb: 'zigZagClimbState',
  zigZagDive: 'zigZagDiveState',
  circularClimb: 'circularClimbState',
  circularDive: 'circularDiveState',
  shot: 'shotState',
  hover: 'hoverState',
  strafe: 'strafeState',
  idle: 'idleState'
}

const dyingState = {
  name: 'dyingState',
  nextStates: [],
  execute: (alien) => {
    alien.disposable = true;
    const gameBoardCell = alien.engine.gameBoard.cellFromCoordinates(alien.coordinates);
    if (gameBoardCell && gameBoardCell.length > 0) {
      gameBoardCell[0][0].gameObject = {};
    }
    return;
  }
};

const landedState = {
  name: 'landedState',
  nextStates: [stateNames.dying],
  execute: (alien) => {
    // TODO
  }
};

const circularDiveState = {
  name: 'circularDiveState',
  execute: (alien) => {
    // TODO
    return;
  }
};

const zigZagDiveState = {
  name: 'zigZagDiveState', 
  nextStates: [stateNames.zigZagClimb, stateNames.landed, stateNames.shot],
  execute: (alien) => { 
    if (alien.gameBoardRow == 1) {
      // TODO: if player cell == alien cell
      alien.fsm.transition(landedState);
      // else wrap around to row 3
      return;
    }
    if (Math.random() * 100 > 50) {
      alien.fsm.transition(zigZagClimbState);
      return;
    }
  }
};

const zigZagClimbState = {
  name: 'zigZagClimbState',
  nextStates: [stateNames.hover, stateNames.zigZagDive, stateNames.shot],
  execute: (alien) => {
    if (alien.gameBoardRow >= alien.engine.gameBoard.rows - 3) {
      if (Math.random() * 100 > 50) {
        alien.fsm.transition(hoverState);
      } else {
        alien.fsm.transition(zigZagDiveState);
      }
      return;
    }
    if (Math.random() * 100 > 50) {
      alien.fsm.transition(zigZagDiveState);
      return;
    }
  }
};

const hoverState = {
  name: 'hoverState',
  nextStates: [stateNames.shot, stateNames.strafe],
  execute: (alien) => {
    // move left/right
    // DON'T drop bombs!
  }
};

const shotState = {
  name: 'shotState',
  nextStates: [stateNames.dying],
  detectCollisions: false,
  execute: (alien) => {
    if (alien && alien.type) {
      switch (alien.type) {
        case alienCommandShipConf.type: 
          if (alien.game.engine.phase == 3) {
            alien.fsm.transition(dyingState);
          }
          break;
        default: 
          alien.fsm.transition(dyingState);
          break;
      }
    }
  }
};

const strafeState = {
  name: 'strafeState',
  nextStates: [stateNames.shot],
  detectCollisions: true,
  execute: (alien) => {
    // move left/right
    // drop bomb maybe
  }
}

const idleState = {
  name: 'idleState',
  nextStates: [stateNames.strafe, stateNames.shot],
  detectCollisions: false,
  execute: (alien) => {
    if (alien.type == alienCommandShipConf.type && alien.engine.phase == 3) {
      alien.fsm.transition(strafeState);
    }
  }
};

const alienCommonFSMStates = {
  shot: shotState
};

const alienCommandShipFSMStates = {
  idle: idleState,
  strafe: strafeState,
  shot: shotState,
  default: idleState
};

const alienWarshipFSMStates = {
  idle: idleState,
  strafe: strafeState,
  shot: shotState,
  default: hoverState
};

const alienFighterFSMStates = {
  zigZagDive: zigZagDiveState,
  zigZagClimb: zigZagClimbState,
  landed: landedState,
  shot: shotState,
  default: strafeState
};

const alienCommandShipUpdate = (commandShipObject) => {
  // TODO
  if (commandShipObject.engine.phase == 3) {
    if (commandShipObject.fsm) {
      commandShipObject.fsm.execute();
      return;
    }
  }
}

const alienWarshipUpdate = (warshipObject) => {
  if (warshipObject.fsm) {
    warshipObject.fsm.execute();
    return;
  }
};

const alienFighterUpdate = (fighterObject) => {
  if (fighterObject.fsm) {
    fighterObject.fsm.execute();
    return;
  }
};

export { 
  alienCommandShipUpdate, 
  alienWarshipUpdate, 
  alienFighterUpdate,
  alienCommonFSMStates,
  alienCommandShipFSMStates,
  alienWarshipFSMStates,
  alienFighterFSMStates
};
