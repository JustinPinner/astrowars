// main game definition and loop

import Engine from './engine/engine';
import { GameBoard } from '../custom/model/gameBoard';
import { player, playerBase } from '../custom/model/players';
import { 
        AlienCommandShip, 
        alienCommandShipConf, 
        AlienWarship, 
        alienWarshipConf,
        AlienFighter,
        alienFighterConf, 
} from '../custom/model/aliens';
import { playerMissile, alienBomb } from '../custom/model/projectiles';
import { processor as keyProcessor } from '../custom/keyProcessor';
import '../css/game.css';

const onSetup = (gameEngine) => {
  // write your custom setup code here - runs after gameEngine's default setup
  gameEngine.level = 1;
  gameEngine.phase = 1;
  const rows = 11;
  const columns = 5;
  gameEngine.gameBoard = new GameBoard(rows, columns);

  const colWidth = Math.floor(gameConfig.canvasses["foreground"].width / gameEngine.gameBoard.columns);
  const rowHeight = Math.floor(gameConfig.canvasses["foreground"].height / gameEngine.gameBoard.rows);
  
  // initialise the gameBoard array in reverse row order
  // remember that row 0 has a greater screen y (vertical) 
  // value than row 1, which itself is greater than 2 etc
  for (let r = gameEngine.gameBoard.rows - 1; r > -1; r -= 1) {
    let row = [];
    for (let c = 0; c < gameEngine.gameBoard.columns; c += 1) {
      const x = Math.floor(colWidth * c);
      const y = Math.floor(rowHeight * r);
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

  // adjust the geometry of the player graphic to fit the gameBoard's dimensions
  // and prepare the player's starting row and column
  const playerCapsuleRow = 1;
  const playerColumn = 2;
  const playerConf = player;
  playerConf.width = gameEngine.gameBoard.board[playerCapsuleRow][playerColumn].width;
  playerConf.height = gameEngine.gameBoard.board[playerCapsuleRow][playerColumn].height;

  const playerObj = game.createObject(
    playerConf, 
    {
      x: gameEngine.gameBoard.board[playerCapsuleRow][playerColumn].x, 
      y: gameEngine.gameBoard.board[playerCapsuleRow][playerColumn].y
    }
  );
  playerObj.gameBoardRow = gameEngine.gameBoard.board[playerCapsuleRow];
  gameEngine.gameBoard.board[playerCapsuleRow][playerColumn].gameObject = playerObj;

  // the player's base section always follows below the capsule's column, never leaving row 0
  const playerBaseRow = playerCapsuleRow - 1;
  const playerBaseConf = playerBase;
  playerBaseConf.width = gameEngine.gameBoard.board[playerCapsuleRow + 1][playerColumn].width;
  playerBaseConf.height = gameEngine.gameBoard.board[playerCapsuleRow + 1][playerColumn].height;

  const playerBaseObj = game.createObject(
    playerBaseConf, 
    {
      x: gameEngine.gameBoard.board[playerBaseRow][playerColumn].x, 
      y: gameEngine.gameBoard.board[playerBaseRow][playerColumn].y
    }
  );
  playerBaseObj.player = playerObj;
  gameEngine.gameBoard.board[playerBaseRow][playerColumn].gameObject = playerBaseObj;
  
  // alien command ships occupy the row below the score (9 by default)
  const commandShipRow = gameEngine.gameBoard.rows - 2;
  for (let c = 1; c < 4; c += 1) {
    const conf = alienCommandShipConf;
    const spawnPos = {
      x: gameEngine.gameBoard.board[commandShipRow][c].x,
      y: gameEngine.gameBoard.board[commandShipRow][c].y
    };
    conf.width = gameEngine.gameBoard.board[commandShipRow][c].width;
    conf.height = gameEngine.gameBoard.board[commandShipRow][c].height;
    conf.sprite.sheet.startFrame = 0;
    gameEngine.gameBoard.board[commandShipRow][c].gameObject = new AlienCommandShip(conf, spawnPos, gameEngine);
  }

  // alien warships hang out on rows (8-7)
  const numWarships = gameEngine.level == 1 ? 3 : gameEngine.level == 2 ? 4 : 5;
  for (let warship = 0; warship < numWarships; warship += 1) {
    const conf = alienWarshipConf;
    let row = Math.floor((gameEngine.gameBoard.rows - 4) + (Math.random() * 2));
    let col = Math.floor(Math.random() * gameEngine.gameBoard.columns);
    // test if this [row][col] position is already occupied by a game object
    while(gameEngine.gameBoard.board[row][col].gameObject.id) {
      row = Math.floor((gameEngine.gameBoard.rows - 5) + (Math.random() * 2));
      col = Math.floor(Math.random() * gameEngine.gameBoard.columns);
    }
    conf.width = gameEngine.gameBoard.board[row][col].width;
    conf.height = gameEngine.gameBoard.board[row][col].height;
    const frame = (row % 2 == 0) ? (col % 2 == 0 ? 0 : 1) : (col % 2 == 0 ? 1 : 0); 
    conf.sprite.sheet.startFrame = frame;
    const spawnPos = {
      x: gameEngine.gameBoard.board[row][col].x,
      y: gameEngine.gameBoard.board[row][col].y
    };
    gameEngine.gameBoard.board[row][col].gameObject = new AlienWarship(conf, spawnPos, gameEngine);
  }  
  
  // alien fighters drop from rows (6-2) and may land on the player's capsule (row 1)
  // for (let r = 6; r > 1; r -= 1) {
  //   const conf = alienFighterConf;
  //   for (let c = 0; c < 5; c += 1) {
  //     const spawnPos = {
  //       x: gameEngine.gameBoard.board[r][c].x,
  //       y: gameEngine.gameBoard.board[r][c].y
  //     };
  //     conf.width = gameEngine.gameBoard.board[r][c].width;
  //     conf.height = gameEngine.gameBoard.board[r][c].height;
  //     conf.sprite.sheet.startFrame = c;
  //     gameEngine.gameBoard.board[r][c].gameObject = new AlienFighter(conf, spawnPos, gameEngine);
  //   }
  // }

  // pre-load heavy images
  // game.imageService.load('path/to/large/image');
}

const onStart = (gameEngine) => {
  // write custom startup code here
}

const onTick = (gameEngine) => {
  // write custom global game state update code here - runs after Engine's tick function
}

const gameConfig = {
  version: 0.1,
  fps: 30,
  canvasses: {
    background: {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      wrapper: {
        selector: '#bgdiv',
        style: {
          backgroundColour: '#000000',
        }
      },
      canvas: {
        selector: '#bgcanvas',
        image: 'nebulae.jpeg',
      },
      alias: 'background'
    },
    foreground: {
      x: ((window.innerWidth / 2) - (300 / 2)),
      y: 0,
      width: 300,
      height: window.innerHeight,
      wrapper: {
        selector: '#fgdiv',
        style: {
          background: 'transparent'
        }
      },
      canvas: {
        selector: '#fgcanvas'
      },
      alias: 'viewport'
    }
  },
  objectTypes: {
    players: player,
    hoverAliens: alienWarshipConf,
    diveAliens: alienFighterConf,
    missiles: playerMissile,
    bombs: alienBomb
  },
  enableTouchUI: 'auto',
  touchUI: {
    x: ((window.innerWidth / 2) - (300 / 2)),
    y: 0,
    width: 300,
    height: 900,
    selector: 'touchUI',
  },
  enableKeyboardUI: true,
  keyProcessor: keyProcessor,
  enableGamepadUI: true,
  lifeCycle: {
    onSetup: onSetup,
    onStart: onStart,
    onTick: onTick
  }
};

const game = new Engine(gameConfig);

(function() {
  game.start();
})();
