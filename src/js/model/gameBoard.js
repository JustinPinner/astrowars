// the gameBoard is zero-based and "upside down" in relation 
// to the screen ([0][0] is bottom-left on-screen)
// e.g.
// row  |--- screen  ---|
// [10] |[0][1][2][3][4]| <-- Score
// [09] |[0][1][2][3][4]| <-- Command Ships   
// [08] |[0][1][2][3][4]| <-- Warships --\ Fighters returning to these rows transition back into
// [07] |[0][1][2][3][4]| <-- Warships --/ warships
// [06] |[0][1][2][3][4]| <-- Fighters --\
// [05] |[0][1][2][3][4]| <-- Fighters    \
// [04] |[0][1][2][3][4]| <-- Fighters     - Warships transition into fighters and dive at the player
// [03] |[0][1][2][3][4]| <-- Fighters    / 
// [02] |[0][1][2][3][4]| <-- Fighters --/
// [01] |[0][1][2][3][4]| <-- Earthship Capsule (player) --\ Locked together until landing 'bonus' phase
// [00] |[0][1][2][3][4]| <-- Earthship Base (player)    --/ when the player has to re-dock the capsule
//      -----------------

class Cell {
  constructor(row, column, x, y, width, height) {
    this._row = row,
    this._column = column,
    this._x = x;
    this._y = y;
    this._width = width,
    this._height = height
    this._objs = [];
  }
  get row() {
    return this._row;
  }
  get column() {
    return this._column;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get contents() {
    return this._objs;
  }

  set row(val) {
    this._row = val;
  }
  set column(val) {
    this._column = val;
  }
  set x(val) {
    this._x = val;
  }
  set y(val) {
    this._y = val;
  }
  set width(val) {
    this._width = val;
  }
  set height(val) {
    this._height = val;
  }
  set contents(objs) {
    this._objs = objs;
  }
}

Cell.prototype.clearObjects = function () {
  this._objs.forEach(obj => {
    obj.disposable = true;
  });
  this._objs = [];
}

Cell.prototype.getObject = function(id) {
  const matched = this._objs.filter( function (obj) { return obj.id == id; });
  return (matched && matched.length > 0) ? matched[0] : undefined;
}

Cell.prototype.addObject = function (obj) {
  this._objs.push(obj);
  return obj;
}

Cell.prototype.removeObject = function (obj) {
  this._objs = this._objs.filter(function (o) { return o.id !== obj.id; });
}

class GameBoard {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.board = [];
  }
}

GameBoard.prototype.cellFromCoordinates = function(point2d) {
  const cells = [];
  this.board.filter((row) => {
    const matched = row.filter((cell) => {
      return(
        cell.x <= point2d.x &&
        cell.x + cell.width > point2d.x &&
        cell.y <= point2d.y &&
        cell.y + cell.height > point2d.y
      );
    });
    if (matched.length > 0) {
      cells.push(matched);
    }
  });
  return cells;
}

GameBoard.prototype.cellNeighbour = function(cell, relativeColumn, relativeRow, canWrap) {
  let nextColumn = cell.column + (relativeColumn || 0);
  let nextRow = cell.row + (relativeRow || 0);

  if (nextColumn > this.columns - 1) {
    nextColumn = (canWrap && canWrap.horizontal) ? 0 : cell.column;
  } else if (nextColumn < 0) {
    nextColumn = (canWrap && canWrap.horizontal) ? this.columns - 1 : cell.column;
  }

  if (nextRow > this.rows - 1) {
    nextRow = (canWrap && canWrap.vertical) ? 1 : cell.row; // 1 because we never wrap to the player base row (0)
  } else if (nextRow < 1) {
    nextRow = (canWrap && canWrap.vertical) ? this.rows - 3 : cell.row; // -3 because we don't wrap to the score or commandship rows & rows is one-based :-/
  }

  return this.board[nextRow][nextColumn];

}

export { 
  GameBoard,
  Cell
};
