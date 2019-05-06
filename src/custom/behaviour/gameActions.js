
import { 
  GameBoard 
} from '../model/gameBoard';
import {
  PlayerCapsule, 
  PlayerBase 
} from '../model/players';
import {
  ScoreDigit
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
      row.push({
        row: r,
        column: c,
        x: x, 
        y: y, 
        width: colWidth, 
        height: rowHeight, 
        gameObject: {}
      });
    }
    gameEngine.gameBoard.board.push(row);  
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
    if (!gameEngine.gameBoard.board[scoreRow][col].gameObject.id) {
      gameEngine.gameBoard.board[scoreRow][col].gameObject = new ScoreDigit(
        gameEngine.config.scoreDigit,
        {
          x: gameEngine.gameBoard.board[scoreRow][col].x, 
          y: gameEngine.gameBoard.board[scoreRow][col].y
        },
        gameEngine  
      );
    }
    gameEngine.gameBoard.board[scoreRow][col].gameObject.value = Number(score.substr(d, 1));
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
    let row = phase.name == 'dive' ? 9 : (gameEngine.gameBoard.rows - 5) + Math.ceil((Math.random() * 2));
    let col = Math.floor(Math.random() * gameEngine.gameBoard.columns);

    if (phase.name !== 'dive') {
      // test if this [row][col] position is already occupied by a game object
      while(gameEngine.gameBoard.board[row][col].gameObject.id) {
        row = (gameEngine.gameBoard.rows - 5) + Math.ceil((Math.random() * 2));
        col = Math.floor(Math.random() * gameEngine.gameBoard.columns);
      }
    }

    const conf = gameEngine.config.warship;
    conf.width = gameEngine.gameBoard.board[row][col].width;
    conf.height = gameEngine.gameBoard.board[row][col].height;
    conf.fsmStates.default = phase.alienState('warship'); //conf.fsmStates['hover'];
    const spawnPos = {
      x: gameEngine.gameBoard.board[row][col].x,
      y: gameEngine.gameBoard.board[row][col].y
    };
    gameEngine.gameBoard.board[row][col].gameObject = new Alien(conf, spawnPos, gameEngine);
    gameEngine.config.game.spawnedWarships = gameEngine.config.game.spawnedWarships ? gameEngine.config.game.spawnedWarships += 1 : 1; 
  }  
};

const spawnPlayerCapsule = (gameEngine) => {
  // prepare the player's starting row and column
  const playerCapsuleConfig = gameEngine.config.playerCapsule;
  const playerCapsuleRow = playerCapsuleConfig.startRow;
  const playerColumn = playerCapsuleConfig.startColumn;

  gameEngine.gameBoard.board[playerCapsuleRow][playerColumn].gameObject = new PlayerCapsule(
    playerCapsuleConfig,
    {
      x: gameEngine.gameBoard.board[playerCapsuleRow][playerColumn].x, 
      y: gameEngine.gameBoard.board[playerCapsuleRow][playerColumn].y
    },
    gameEngine
  )
};

const spawnPlayerBase = (gameEngine) => {
  // The player's base section behaves differently according to the game phase;
  // it will follow the capsule's column during combat play and switches to
  // sideways scrolling during the re-docking phase. It never leaves row 0 though.
  // The switching of modes is managed by the base object's finite state machine.
  const playerBaseConfig = gameEngine.config.playerBase;
  const playerBaseRow = playerBaseConfig.startRow;
  const playerBaseColumn = playerBaseConfig.startColumn;
 
  gameEngine.gameBoard.board[playerBaseRow][playerBaseColumn].gameObject = new PlayerBase(
    playerBaseConfig,
    {
      x: gameEngine.gameBoard.board[playerBaseRow][playerBaseColumn].x, 
      y: gameEngine.gameBoard.board[playerBaseRow][playerBaseColumn].y
    },
    gameEngine
  );

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
  showScore(gameEngine);
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