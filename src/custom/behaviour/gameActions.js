
import { 
  GameBoard,
  Cell 
} from '../model/gameBoard';
import {
  PlayerCapsule, 
  PlayerBase 
} from '../model/players';
import {
  Digit
} from '../model/score';
import { 
  Alien 
} from '../model/aliens';

const initGameBoard = (gameEngine) => {
  gameEngine.gameBoard = new GameBoard(gameEngine.config.game.gameBoardRows, gameEngine.config.game.gameBoardColumns);

  const colWidth = Math.floor(gameEngine.config.game.canvasses["foreground"].width / gameEngine.gameBoard.columns);
  const rowHeight = Math.floor(gameEngine.config.game.canvasses["foreground"].height / gameEngine.gameBoard.rows);
  
  // initialise the gameBoard array in reverse row order
  // note that row 0 has a greater screen y (vertical) 
  // value than row 1, which itself is greater than 2 etc
  for (let r = 0; r < gameEngine.gameBoard.rows; r += 1) {  
    let row = [];
    for (let c = 0; c < gameEngine.gameBoard.columns; c += 1) {
      const x = Math.floor(colWidth * c);
      const y = Math.floor(rowHeight * ((gameEngine.gameBoard.rows - 1) - r));
      row.push(new Cell(r, c, x, y, colWidth, rowHeight));
    }
    gameEngine.gameBoard.board.push(row);  
  }
};

const showLevel = (gameEngine) => {
  if (!gameEngine.gameBoard) {
    return;
  }
  const levelRow = 10;  // we're re-using the score location
  const level = gameEngine.config.game.level.toString();
  for (let d=0; d < level.length; d+=1) {
    const pad = gameEngine.gameBoard.columns - level.length - 1;
    const col = pad + d;
    const cell = gameEngine.gameBoard.board[levelRow][col];
    if (cell.contents.length < 1) {
      const digit = new Digit(
        gameEngine.config.digit,
        {
          x: cell.x, 
          y: cell.y
        },
        gameEngine  
      );
      digit.value = Number(level.substr(d, 1));
      cell.addObject(digit);
    }
  }
};

const showScore = (gameEngine) => {
  if (!gameEngine.gameBoard) {
    return;
  }
  const scoreRow = 10;
  const score = gameEngine.config.game.playerPoints.toString();
  for (let d=0; d < score.length; d+=1) {
    const pad = gameEngine.gameBoard.columns - score.length - 1;
    const col = pad + d;
    const cell = gameEngine.gameBoard.board[scoreRow][col];
    const digit = (cell.contents[0] && cell.contents[0].isDigit) ? cell.contents[0] : cell.addObject(new Digit(
      gameEngine.config.digit,
      {
        x: cell.x, 
        y: cell.y
      },
      gameEngine  
    ));
    digit.value = Number(score.substr(d, 1));
  }
}

const spawnCommandShips = (gameEngine, qty) => {
  // command ships occupy the row below the score (9 by default)
  // in the first phase they don't do anything though, so don't include 
  // them in the count of aliens spawned
  const commandShipRow = gameEngine.gameBoard.rows - 2;
  const phase = gameEngine.config.game.phases(gameEngine.config.game.phase);
  const numShips = qty || phase.alienConcurrent('commandShip');
  for (let c = 1; c < numShips + 1; c += 1) {
    const conf = gameEngine.config.commandShip;
    const spawnPos = {
      x: gameEngine.gameBoard.board[commandShipRow][c].x,
      y: gameEngine.gameBoard.board[commandShipRow][c].y
    };
    conf.width = gameEngine.gameBoard.board[commandShipRow][c].width;
    conf.height = gameEngine.gameBoard.board[commandShipRow][c].height;
    // set the alien's default behaviour
    conf.fsmStates.default = phase.alienState('commandShip'); // conf.fsmStates['idle'];
    gameEngine.gameBoard.board[commandShipRow][c].gameObject = new Alien(conf, spawnPos, gameEngine);
    gameEngine.config.game.spawnedCommandShips = gameEngine.config.game.spawnedCommandShips ? gameEngine.config.game.spawnedCommandShips += 1 : 1; 
  }
};

const spawnWarships = (gameEngine, qty) => {
  // alien warships hang out on rows (8-7)
  const phase = gameEngine.config.game.phases(gameEngine.config.game.phase);
  const numShips = qty || phase.alienConcurrent('warship');
  for (let warship = 0; warship < numShips; warship += 1) {
    const row = phase.name == 'dive' ? gameEngine.gameBoard.rows - 2 : (gameEngine.gameBoard.rows - 5) + Math.ceil((Math.random() * 2));
    const col = Math.floor(Math.random() * gameEngine.gameBoard.columns);
    const cell = gameEngine.gameBoard.board[row][col];
    const conf = gameEngine.config.warship;
    conf.width = cell.width;
    conf.height = cell.height;
    conf.fsmStates.default = phase.alienState('warship'); //conf.fsmStates['hover'];
    const spawnPos = {
      x: cell.x,
      y: cell.y
    };
    cell.addObject(new Alien(conf, spawnPos, gameEngine));
    gameEngine.config.game.spawnedWarships = gameEngine.config.game.spawnedWarships ? gameEngine.config.game.spawnedWarships += 1 : 1; 
  }  
};

const spawnPlayerCapsule = (gameEngine) => {
  // prepare the player's starting row and column
  const playerCapsuleConfig = gameEngine.config.playerCapsule;
  const playerCapsuleRow = playerCapsuleConfig.startRow;
  const playerColumn = playerCapsuleConfig.startColumn;
  const cell = gameEngine.gameBoard.board[playerCapsuleRow][playerColumn];
  const playerCapsule = new PlayerCapsule(
    playerCapsuleConfig,
    {
      x: cell.x, 
      y: cell.y
    },
    gameEngine
  );
  cell.addObject(playerCapsule);
};

const spawnPlayerBase = (gameEngine) => {
  // The player's base section behaves differently according to the game phase;
  // it will follow the capsule's column during combat play and switches to
  // sideways scrolling during the re-docking phase. It never leaves row 0 though.
  // The switching of modes is managed by the base object's finite state machine.
  const playerBaseConfig = gameEngine.config.playerBase;
  const playerBaseRow = playerBaseConfig.startRow;
  const playerBaseColumn = playerBaseConfig.startColumn;
  const cell = gameEngine.gameBoard.board[playerBaseRow][playerBaseColumn];
  const playerBase = new PlayerBase(
    playerBaseConfig,
    {
      x: cell.x, 
      y: cell.y
    },
    gameEngine
  );
  cell.addObject(playerBase)
};

const reset = (gameEngine) => {
  // remove all game objects
  gameEngine.gameObjects = [];
  // reset the gameboard
  initGameBoard(gameEngine);
  // reset score
  gameEngine.config.game.playerPoints = 0;
  // reset alien counts
  gameEngine.config.game.spawnedCommandShips = 0;
  gameEngine.config.game.spawnedWarships = 0;
  // reset player lives
  gameEngine.config.game.playerLives = 5;
};

const initDemoMode = (gameEngine) => {
  reset(gameEngine);
  gameEngine.config.game.phase = 0;
  showLevel(gameEngine);
  spawnCommandShips(gameEngine);  
  spawnWarships(gameEngine);
};

const gameStart = (gameEngine) => {
  reset(gameEngine);
  gameEngine.config.game.phase = 1;
  showScore(gameEngine);
  spawnCommandShips(gameEngine);  
  spawnWarships(gameEngine);
  spawnPlayerCapsule(gameEngine);
  spawnPlayerBase(gameEngine);
};

const nextPhase = (gameEngine) => {
  const score = gameEngine.config.game.playerPoints;
  const phase = gameEngine.config.game.phase;
  reset(gameEngine);
  gameEngine.config.game.playerPoints = score;
  gameEngine.config.game.phase = phase + 1;
  showScore(gameEngine);
  spawnCommandShips(gameEngine);  
  spawnWarships(gameEngine);
  spawnPlayerCapsule(gameEngine);
  spawnPlayerBase(gameEngine);
};

export {
  showScore,
  initDemoMode,
  spawnWarships,
  spawnCommandShips,
  gameStart,
  nextPhase
}