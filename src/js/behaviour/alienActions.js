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
  idle: 'idleState',
  pause: 'pauseState',
  resume: 'resumeState',
  flash: 'flashState'
};

const horizontalMove = {
  right: 1,   // right
  left: -1   // left
};

const verticalMove = {
  up: 1,  // up
  down: -1    // down
};

const verticalMoveDown = {
  down: -1    // down
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
    vertical: verticalMoveDown
  },
};

const nextAvailableCell = (alien, moveInstruction, canWrap) => {
  let relativeColumn = 0;
  let relativeRow = 0;

  if (moveInstruction.horizontal && moveInstruction.vertical) {
    relativeColumn = Math.random() * 100 > 50 ? moveInstruction.horizontal.right : moveInstruction.horizontal.left;
    relativeRow = moveInstruction.vertical.up ? ((Math.random() * 100 > 50) ? moveInstruction.vertical.up : moveInstruction.vertical.down) : moveInstruction.vertical.down;
  } else if (moveInstruction.horizontal) {
    relativeColumn = Math.random() * 100 > 50 ? moveInstruction.horizontal.right : moveInstruction.horizontal.left; 
  } else {
    relativeRow = Math.random() * 100 > 50 ? moveInstruction.vertical.up : moveInstruction.vertical.down;     
  }

  if (alien.isCommandShip && alien.engine.config.phase !== 3) {
    relativeRow = 0;
  }

  if (relativeColumn !== 0 && !alien.canMoveHorizontally(relativeColumn, canWrap && canWrap.horizontal)) {
    relativeColumn *= -1;
  }
  
  if (relativeRow !== 0 && !alien.canMoveVertically(relativeRow, canWrap && canWrap.vertical)) {
    relativeRow *= -1;
  }

  let nextCell = alien.engine.gameBoard.cellNeighbour(alien.currentCell, relativeColumn, relativeRow, canWrap);

  return nextCell;
};

const dyingState = {
  name: 'dyingState',
  nextStates: [],
  execute: (alien) => {
    alien.disposable = true;
    const gameBoardCell = alien.engine.gameBoard.cellFromCoordinates(alien.coordinates);
    if (gameBoardCell && gameBoardCell.length > 0) {
      const cell = gameBoardCell[0][0];
      cell.removeObject(alien);
    }
    return;
  }
};

const landedState = {
  name: 'landedState',
  nextStates: [stateNames.dying],
  execute: (alien) => {
    // STOP!!

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
  minimumExecutionInterval: 500,
  execute: (alien) => {     
    // enable vertical screen wrap
    const canWrap = {
      horizontal: false,
      vertical: true
    };

    // drop bomb maybe (only between rows 9 and 5)
    const bombLimit = {
      upper: alien.engine.gameBoard.rows - 2,
      lower: 5
    };

    switch (alien.currentCell.row) {
      case (1 || 0): 
        // check player collision
        const player = alien.engine.getObjectByType('playerCapsule');
        if (player && player.currentCell.column == alien.currentCell.column) {
          alien.engine.eventSystem.dispatchEvent(alien.engine.id, { action:'PLAYEROVERRUN', source: alien, target: player });
          alien.fsm.transition(landedState);
          return;
        }
        break;
    }

    const nextCell = nextAvailableCell(alien, moveInstructions.diagonalDown, canWrap);

    if (nextCell) {
      alien.moveToCell(nextCell);
    }

    if (alien.currentCell.row < bombLimit.upper && alien.currentCell.row > bombLimit.lower) {
      // drop bomb maybe
      if (Math.random() * 100 > 50) {
        alien.shoot();
      }
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
    const engine = alien.engine;
    if (!alien.isCommandShip || (alien.isCommandShip && engine.config.game.phase == 3)) { 
      engine.eventSystem.dispatchEvent(engine.id, {action: 'PLAYSOUND', value: (alien.conf.soundEffects ? alien.conf.soundEffects['die'] : engine.defaultSoundEffects['die'])});
      engine.eventSystem.dispatchEvent(engine.id, {action: 'ADDPLAYERPOINTS', value: alien.pointsValue});
      engine.eventSystem.dispatchEvent(engine.id, {action: 'ALIENDEATH', value: alien.type});
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
    // transition to dive state maybe
    if (Math.random() * 100 > 50) {
      const divingAliens = alien.engine.getObjectsByState(zigZagDiveState);
      if (!divingAliens) {
        alien.fsm.transition(zigZagDiveState, true);
      } 
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

const pauseState = {
  name: 'pauseState',
  nextStates: [stateNames.resume],
  detectCollision: false,
  processUpdates: false,
  force: true,
  execute: (alien) => {}
};

const resumeState = {
  name: 'resumeState',
  nextStates: [stateNames.hover, stateNames.strafe, stateNames.idle],
  detectCollisions: true,
  processUpdates: true,
  execute: (alien) => {
    // if (alien.savedState && nextStates.includes(alien.savedState.name)) {
    //   alien.fsm.transition(alien.savedState);
    //   alien.savedState = undefined;
    // } else {
    //   alien.fsm.transition(alien.fsm.states.default)
    // }
  }
}

const flashState = {
  name: 'flashState',
  nextStates: [stateNames.dying],
  detectCollisions: false,
  processUpdates: false,
  minimumExecutionInterval: 300,
  minimumStateDuration: 2000,
  force: true,
  execute: (alien) => {
    if ((alien.fsm.currentState.minimumStateDuration || 0) <= alien.fsm.lastExecutionTime - alien.fsm.startTime) {
      // we've done our time, transition to next state
      alien.fsm.transition(dyingState);
    }
    // invert drawable state
    alien.canDraw = !alien.canDraw;
  }
}

const alienFSMStates = () => {
  return {
    idle: idleState,
    hover: hoverState,
    strafe: strafeState,
    zigZagDive: zigZagDiveState,
    zigZagClimb: zigZagClimbState,
    shot: shotState,
    landed: landedState,
    pause: pauseState,
    resume: resumeState,
    flash: flashState,
    dying: dyingState
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
