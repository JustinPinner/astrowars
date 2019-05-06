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
    nextRow = (canWrap && canWrap.vertical) ? this.rows - 2 : cell.row; // -2 because we don't wrap to the score or commandship rows
  }

  return this.board[nextRow][nextColumn];

}

export { GameBoard };
