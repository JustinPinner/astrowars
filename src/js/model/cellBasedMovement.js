// some definitions for movement within a cell-based game world

export const horizontalMove = {
  right: 1,
  left: -1,
  none: 0
};

export const verticalMove = {
  up: 1,
  down: -1,
  none: 0
};

export const verticalMoveDown = {
  down: verticalMove.down
};

export const moveInstructions = {
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

