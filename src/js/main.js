// main game definition and loop

import Engine from './engine/engine';
import { GameBoard } from '../custom/model/gameBoard';
import { CustomConfig } from '../custom/config';
import {
  PlayerCapsule, 
  PlayerBase 
} from '../custom/model/players';
import {
  ScoreDigit
} from '../custom/model/score';
import { Alien } from '../custom/model/aliens';
import '../css/game.css';

const onSetup = (gameEngine) => {
  // write your custom setup code here - runs after gameEngine's default setup
  gameEngine.playerLives = 5;
  gameEngine.score = 0;
  gameEngine.level = 1;
  gameEngine.phase = 1;
  const rows = 11;
  const columns = 5;
  gameEngine.gameBoard = new GameBoard(rows, columns);

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

  // initialise the score row
  for (let col=0; col < columns; col += 1) {
    gameEngine.gameBoard.board[10][col].gameObject = new ScoreDigit(
      gameEngine.config.scoreDigit,
      {
        x: gameEngine.gameBoard.board[10][col].x, 
        y: gameEngine.gameBoard.board[10][col].y
      },
      gameEngine  
    )
  }

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

  // The player's base section behaves differently according to the game phase;
  // it will follow the capsule's column during combat play and switches to
  // sideways scrolling during the re-docking phase. It never leaves row 0 though.
  // The switching of modes is managed by the base object's finite state machine.
  const playerBaseConfig = gameEngine.config.playerBase;
  const playerBaseRow = playerBaseConfig.startRow;
  const playerBaseColumn = playerBaseConfig.startColumn;
 
  gameEngine.gameBoard.board[playerBaseRow][playerColumn].gameObject = new PlayerBase(
    playerBaseConfig,
    {
      x: gameEngine.gameBoard.board[playerBaseRow][playerBaseColumn].x, 
      y: gameEngine.gameBoard.board[playerBaseRow][playerBaseColumn].y
    },
    gameEngine
  );
  
  // alien command ships occupy the row below the score (9 by default)
  // in the first phase they don't do anything though, so don't include 
  // them in the count of aliens spawned
  const commandShipRow = gameEngine.gameBoard.rows - 2;
  for (let c = 1; c < 4; c += 1) {
    const conf = gameEngine.config.commandShip;
    const spawnPos = {
      x: gameEngine.gameBoard.board[commandShipRow][c].x,
      y: gameEngine.gameBoard.board[commandShipRow][c].y
    };
    conf.width = gameEngine.gameBoard.board[commandShipRow][c].width;
    conf.height = gameEngine.gameBoard.board[commandShipRow][c].height;
    // set the alien's default behaviour
    conf.fsmStates.default = conf.fsmStates['idle'];
    gameEngine.gameBoard.board[commandShipRow][c].gameObject = new Alien(conf, spawnPos, gameEngine);
  }

  // alien warships hang out on rows (8-7)
  const numWarships = gameEngine.level == 1 ? 3 : gameEngine.level == 2 ? 4 : 5;
  for (let warship = 0; warship < numWarships; warship += 1) {
    const conf = gameEngine.config.warship;
    let row = Math.floor((gameEngine.gameBoard.rows - 4) + (Math.random() * 2));
    let col = Math.floor(Math.random() * gameEngine.gameBoard.columns);
    // test if this [row][col] position is already occupied by a game object
    while(gameEngine.gameBoard.board[row][col].gameObject.id) {
      row = Math.floor((gameEngine.gameBoard.rows - 5) + (Math.random() * 2));
      col = Math.floor(Math.random() * gameEngine.gameBoard.columns);
    }
    conf.width = gameEngine.gameBoard.board[row][col].width;
    conf.height = gameEngine.gameBoard.board[row][col].height;
    conf.fsmStates.default = conf.fsmStates['hover'];
    const spawnPos = {
      x: gameEngine.gameBoard.board[row][col].x,
      y: gameEngine.gameBoard.board[row][col].y
    };
    gameEngine.gameBoard.board[row][col].gameObject = new Alien(conf, spawnPos, gameEngine);
    gameEngine.spawnedAliens = gameEngine.spawnedAliens ? gameEngine.spawnedAliens + 1 : 1;
    gameEngine.config.game.spawnedAliens += 1; 
  }  
  
  // pre-load heavy images
  // game.imageService.load('path/to/large/image');
};

const onStart = (gameEngine) => {
  // write custom startup code here
};

const onTick = (gameEngine) => {
  // write custom global game state update code here - your code runs after Engine's tick function completes
};

const customLifecycle = {
  onSetup: onSetup, 
  onStart: onStart, 
  onTick: onTick
};

const game = new Engine(CustomConfig, customLifecycle);

(function() {
  game.start();
})();
