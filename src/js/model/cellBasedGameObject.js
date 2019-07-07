 
import { GameObject } from 'eccentric-engine/Engine';
import { 
  horizontalMove,
  verticalMove 
} from './cellBasedMovement';

// A super-class derived from a generic GameObject that all our custom 
// game objects will extend.
// Because our game code runs everything within the confines of a gameBoard
// comprised of rows and columns (cells), and everything moves from
// one cell to another

class CellBasedGameObject extends GameObject {
  constructor(conf, position, engine) {
    super(conf, position, engine);
  }
  get currentCell() {
    return this.engine.gameBoard.cellFromCoordinates(this.coordinates)[0][0];
  }
  get detectCollisions() {
    return this.fsm && this.fsm.currentState && this.fsm.currentState.detectCollisions;
  }	
}

// some behaviours that are common to all our custom objects (may be overridden by descendent classes)

CellBasedGameObject.prototype.selectSprite = function(cell) {
  // draw sprite image based on default or row/col position
  this.sprite = this.sprites.filter(function(sprite){return sprite.isDefault || (sprite.fromRow || cell.row) >= cell.row && (sprite.toRow || cell.row) <= cell.row})[0];  
  let frame;
  if (this.sprite.columns > 1 || this.sprite.rows > 1) {
    frame = (cell.row % 2 == 0) ? (cell.column % 2 == 0 ? 0 : 1) : ( cell.column % 2 == 0 ? 1 : 0);
  } else {
    frame = 0;
  } 
  this.sprite.frame = frame;
}

CellBasedGameObject.prototype.moveToCell = function (cell) {
  const currentCell = this.currentCell;
  if (!currentCell) {
      console.log(`Live CellBasedGameObject (${this.id}) without an address :(`);
      return;
  }
  cell.addObject(this);
  this.coordinates.x = cell.x;
  this.coordinates.y = cell.y;
  currentCell.removeObject(this);
}

CellBasedGameObject.prototype.canMoveVertically = function (dir, canWrap) {
  switch (dir) {
    case verticalMove.up:
      return (this.currentCell.row < this.engine.gameBoard.rows - 1) || canWrap;
    case verticalMove.down:
      return (this.currentCell.row > 1) || canWrap;
  }
};

CellBasedGameObject.prototype.canMoveHorizontally = function (dir, canWrap) {
  switch (dir) {
    case horizontalMove.left:
      return (this.currentCell.column > 0) || canWrap;
    case horizontalMove.right:
      return (this.currentCell.column < this.engine.gameBoard.columns - 1) || canWrap;
  }
};

CellBasedGameObject.prototype.moveLeft = function(canWrap) {
  const maybeNeighbourCell = this.engine.gameBoard.cellNeighbour(this.currentCell, horizontalMove.left, verticalMove.none, canWrap);
  if (maybeNeighbourCell) {
		this.moveToCell(maybeNeighbourCell);
	}
}

CellBasedGameObject.prototype.moveRight = function(canWrap) {
  let maybeNeighbourCell = this.engine.gameBoard.cellNeighbour(this.currentCell, horizontalMove.right, verticalMove.none, canWrap);
  if (maybeNeighbourCell) {
		this.moveToCell(maybeNeighbourCell);
	}
}

CellBasedGameObject.prototype.moveUp = function(canWrap) {
  const maybeNeighbourCell = this.engine.gameBoard.cellNeighbour(this.currentCell, horizontalMove.none, verticalMove.up, canWrap);
  if (maybeNeighbourCell) {
		this.moveToCell(maybeNeighbourCell);
	}
}

CellBasedGameObject.prototype.moveDown = function(canWrap) {
  const maybeNeighbourCell = this.engine.gameBoard.cellNeighbour(this.currentCell, horizontalMove.none, verticalMove.down, canWrap);
  if (maybeNeighbourCell) {
		this.moveToCell(maybeNeighbourCell);
	}
}

CellBasedGameObject.prototype.preDraw = function() {
  this.selectSprite(this.currentCell);
}

export { 
  CellBasedGameObject 
};
