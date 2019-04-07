// write alien behaviours here
// these functions will be bound into GameObject instances with .bind(this, this)
// so remember to change this.state if/when needed

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
};

const horizontalMove = {
  inc: 1,   // right
  dec: -1   // left
};

const verticalMove = {
  inc: -1,  // up
  dec: 1    // down
};

const moveInstructions = {
  leftRight: {
    horizontal: horizontalMove,  
  },
  upDown: {
    vertical: verticalMove  
  },
  diagonal: {
    horizontal: horizontalMove,
    vertical: verticalMove
  },
  diagonalDown: {
    horizontal: horizontalMove,
    vertical: verticalMove
  },
};

const nextAvailableCell = (alien, moveInstruction) => {
  const maybeCell = alien.engine.gameBoard.cellFromCoordinates(alien.coordinates);
  if (!maybeCell) {
    // Wat?
    return;
  }
  const currentCell = maybeCell[0][0];

  let relativeColumn = 0;
  let relativeRow = 0;
  if (moveInstruction.horizontal && moveInstruction.vertical) {
    relativeColumn = Math.random() * 100 > 50 ? moveInstruction.horizontal.inc : moveInstruction.horizontal.dec; 
    relativeRow = Math.random() * 100 > 50 ? moveInstruction.vertical.inc : moveInstruction.vertical.dec;
  } else if (moveInstruction.horizontal) {
    relativeColumn = Math.random() * 100 > 50 ? moveInstruction.horizontal.inc : moveInstruction.horizontal.dec; 
  } else {
    relativeRow = Math.random() * 100 > 50 ? moveInstruction.vertical.inc : moveInstruction.vertical.dec;     
  }

  let maybeNeighbourCell = alien.engine.gameBoard.cellNeighbour(currentCell, relativeColumn, relativeRow);

  if (maybeNeighbourCell && maybeNeighbourCell.length > 0) {
    const neighbourCell = maybeNeighbourCell[0][0];
    if (!neighbourCell.gameObject.type) {
      return neighbourCell;
    } else {
      // try other direction
      relativeRow = (relativeRow > 0) ? relativeRow * -1 : 0;
      relativeColumn = (relativeColumn > 0) ? relativeColumn * -1 : 0;      

      maybeNeighbourCell = alien.engine.gameBoard.cellNeighbour(currentCell, relativeColumn, relativeRow);

      if (maybeNeighbourCell && maybeNeighbourCell.length > 0) {
        const neighbourCell = maybeNeighbourCell[0][0];
        if (!neighbourCell.gameObject.type) {
          // move here
          return neighbourCell;
        } else {
          return null;
        }        
      }
    }
  } else {
    // try other direction
    relativeRow = (relativeRow > 0) ? relativeRow * -1 : 0;
    relativeColumn = (relativeColumn > 0) ? relativeColumn * -1 : 0;      
  
    maybeNeighbourCell = alien.engine.gameBoard.cellNeighbour(currentCell, relativeColumn, relativeRow);
  
    if (maybeNeighbourCell && maybeNeighbourCell.length > 0) {
      const neighbourCell = maybeNeighbourCell[0][0];
      if (!neighbourCell.gameObject.type) {
        // move here
        return neighbourCell;
      } else {
        return null;
      }        
    }
  }
};

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
  detectCollisions: true,
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
    const freeCell = nextAvailableCell(alien, moveInstructions.diagonal);
    if (freeCell) {
      alien.moveToCell(freeCell);
    }
    return;
  }
};

const zigZagClimbState = {
  name: 'zigZagClimbState',
  nextStates: [stateNames.hover, stateNames.zigZagDive, stateNames.shot],
  detectCollisions: true,
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
  minimumExecutionInterval: 500,
  detectCollisions: true,
  execute: (alien) => {
    // DON'T drop bombs!
    // move left/right
    const freeCell = nextAvailableCell(alien, moveInstructions.leftRight);
    if (freeCell) {
      alien.moveToCell(freeCell);
    }
    if (Math.random() * 100 > 75) {
      alien.fsm.transition(strafeState);
    }
    return;
  }
};

const shotState = {
  name: 'shotState',
  nextStates: [stateNames.dying],
  detectCollisions: false,
  execute: (alien) => {
    if (alien.isCommandShip) { 
      if (alien.engine.phase == 3) {
        alien.fsm.transition(dyingState);
      }
    } else {
      alien.fsm.transition(dyingState);
    }
  }
};

const strafeState = {
  name: 'strafeState',
  nextStates: [stateNames.shot],
  detectCollisions: true,
  minimumExecutionInterval: 500,
  execute: (alien) => {
    // move left/right
    const freeCell = nextAvailableCell(alien, moveInstructions.leftRight);
    if (freeCell) {
      alien.moveToCell(freeCell);
    }
    // drop bomb maybe
    if (Math.random() * 100 > 50) {
      alien.shoot();
    }
    return;
  }
};

const idleState = {
  name: 'idleState',
  nextStates: [stateNames.strafe, stateNames.shot],
  detectCollisions: false,
  execute: (alien) => {
    if (alien.isCommandShip && alien.engine.phase == 3) {
      alien.fsm.transition(strafeState);
    }
  }
};

const alienFSMStates = () => {
  return {
    idle: idleState,
    hover: hoverState,
    strafe: strafeState,
    zigZagDive: zigZagDiveState,
    zigZagClimb: zigZagClimbState,
    shot: shotState,
    landed: landedState,
  }; 
};

const alienUpdate = (alien) => {
  if (alien.fsm) {
    alien.fsm.execute();
  }
};

export { 
  alienUpdate,
  alienFSMStates
};
