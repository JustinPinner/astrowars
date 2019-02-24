// main game definition and loop

import Engine from './engine/engine';
import { player, playerBase } from '../custom/model/players';
import { alienCommandShip, alienWarship, alienFighter } from '../custom/model/aliens';
import { playerMissile, alienBomb } from '../custom/model/projectiles';
import { processor as keyProcessor } from '../custom/keyProcessor';

import '../css/game.css';

// the gameBoard is zero-based and "upside down" in relation 
// to the screen ([0][0] is bottom-left on-screen)
// e.g.
// row  |--- screen  ---|
// [10] |[0][1][2][3][4]| <-- Score
// [09] |[0][1][2][3][4]| <-- Command Ships   
// [08] |[0][1][2][3][4]| <-- Warships
// [07] |[0][1][2][3][4]| <-- Warships
// [06] |[0][1][2][3][4]| <-- Fighters --\
// [05] |[0][1][2][3][4]| <-- Fighters    \
// [04] |[0][1][2][3][4]| <-- Fighters     - Fighters transition from Warships and dive at the player
// [03] |[0][1][2][3][4]| <-- Fighters    / 
// [02] |[0][1][2][3][4]| <-- Fighters --/
// [01] |[0][1][2][3][4]| <-- Earthship Capsule (player) -\ Locked together until landing 'bonus' phase
// [00] |[0][1][2][3][4]| <-- Earthship Base (player)    -/ when the player has to re-dock the capsule
//      -----------------
const gameBoard = {
  columns: 5, // 0-4
  rows: 11,   // 0-9 (10 rows) for game objects + 10 (1 row) for score
  board: []
};

const onSetup = (gameEngine) => {
  // write your custom setup code here - runs after gameEngine's default setup
  gameEngine.level = 1;
  gameEngine.phase = 1;

  const colWidth = Math.floor(gameConfig.canvasses["foreground"].width / gameBoard.columns);
  const rowHeight = Math.floor(gameConfig.canvasses["foreground"].height / gameBoard.rows);

  // initialise the gameBoard array in reverse row order
  // remember that row 0 has a greater screen y (vertical) 
  // value than row 1, which itself is greater than 2 etc
  for (let r = gameBoard.rows - 1; r > -1; r -= 1) {
    let row = [];
    for (let c = 0; c < gameBoard.columns; c += 1) {
      const x = Math.floor(colWidth * c);
      const y = Math.floor(rowHeight * r);
      row.push({
        x: x, 
        y: y, 
        width: colWidth, 
        height: rowHeight, 
        gameObject: {}
      });
    }
    gameBoard.board.push(row);  
  }

  // adjust the geometry of the player graphic to fit the gameBoard's dimensions
  // and prepare the player's starting row and column
  const playerCapsuleRow = 1;
  const playerColumn = 2;
  const playerConf = player;
  playerConf.width = gameBoard.board[playerCapsuleRow][playerColumn].width;
  playerConf.height = gameBoard.board[playerCapsuleRow][playerColumn].height;

  const playerObj = game.createObject(
    playerConf, 
    {
      x: gameBoard.board[playerCapsuleRow][playerColumn].x, 
      y: gameBoard.board[playerCapsuleRow][playerColumn].y
    }
  );
  playerObj.gameBoardRow = gameBoard.board[playerCapsuleRow];
  gameBoard.board[playerCapsuleRow][playerColumn].gameObject = playerObj;

  // the player's base section always follows below the capsule's column, never leaving row 0
  const playerBaseRow = playerCapsuleRow - 1;
  const playerBaseConf = playerBase;
  playerBaseConf.width = gameBoard.board[playerCapsuleRow + 1][playerColumn].width;
  playerBaseConf.height = gameBoard.board[playerCapsuleRow + 1][playerColumn].height;

  const playerBaseObj = game.createObject(
    playerBaseConf, 
    {
      x: gameBoard.board[playerBaseRow][playerColumn].x, 
      y: gameBoard.board[playerBaseRow][playerColumn].y
    }
  );
  playerBaseObj.player = playerObj;
  gameBoard.board[playerBaseRow][playerColumn].gameObject = playerBaseObj;
  
  // alien command ships occupy the row below the score (9 by default)
  const commandShipRow = gameBoard.rows - 2;
  for (let c = 1; c < 4; c += 1) {
    const spawnPos = {
      x: gameBoard.board[commandShipRow][c].x,
      y: gameBoard.board[commandShipRow][c].y
    };
    const alienCommandShipConf = alienCommandShip;
    alienCommandShipConf.width = gameBoard.board[commandShipRow][c].width;
    alienCommandShipConf.height = gameBoard.board[commandShipRow][c].height;
    alienCommandShipConf.sprite.sheet.startFrame = 0;
    gameBoard.board[commandShipRow][c].gameObject = game.createObject(alienCommandShipConf, spawnPos);
  }

  // alien warships hang out on rows (8-7)
  const numWarships = gameEngine.level == 1 ? 3 : gameEngine.level == 2 ? 4 : 5;
  const alienWarshipConf = alienWarship;
  for (let warship = 0; warship < numWarships; warship += 1) {
    let row = Math.floor((gameBoard.rows - 4) + (Math.random() * 2));
    let col = Math.floor(Math.random() * gameBoard.columns);
    // test if this [row][col] position is already occupied by a game object
    while(gameBoard.board[row][col].gameObject.id) {
      row = Math.floor((gameBoard.rows - 5) + (Math.random() * 2));
      col = Math.floor(Math.random() * gameBoard.columns);
    }
    alienWarshipConf.width = gameBoard.board[row][col].width;
    alienWarshipConf.height = gameBoard.board[row][col].height;
    const spawnPos = {
      x: gameBoard.board[row][col].x,
      y: gameBoard.board[row][col].y
    };
    const frame = (row % 2 == 0) ? (col % 2 == 0 ? 0 : 1) : (col % 2 == 0 ? 1 : 0); 
    alienWarshipConf.sprite.sheet.startFrame = frame;
    gameBoard.board[row][col].gameObject = game.createObject(alienWarshipConf, spawnPos);
  }  
  
  gameEngine.board = gameBoard;

  //let warshipsGenerated = 0;
  // while (warshipsGenerated < numWarships - 1) {
  //   const row = Math.floor((gameBoard.rows - 5) + (Math.random() * 2));
  //   const col = Math.floor(Math.random() * gameBoard.columns);
  //   if (!gameBoard.board[row][col].gameObject.id) {
  //     alienWarshipConf.width = gameBoard.board[row][col].width;
  //     alienWarshipConf.height = gameBoard.board[row][col].height;
  //     const spawnPos = {
  //       x: gameBoard.board[row][col].x,
  //       y: gameBoard.board[row][col].y
  //     };
  //     const frame = (row % 2 == 0) ? (col % 2 == 0 ? 0 : 1) : (col % 2 == 0 ? 1 : 0); 
  //     alienWarshipConf.sprite.sheet.startFrame = frame;
  //     gameBoard.board[row][col].gameObject = game.createObject(alienWarshipConf, spawnPos);
  //     warshipsGenerated += 1; 
  //   }
  //   // !WARNING! infinite loop risk
  // }

  // for (let r = 8; r > 6; r -= 1) {
  //   for (let c = 0; c < 5; c += 1) {
  //     const spawnPos = {
  //       x: gameBoard.board[r][c].x,
  //       y: gameBoard.board[r][c].y
  //     };
  //     const alienWarshipConf = alienWarship;
  //     alienWarshipConf.width = gameBoard.board[r][c].width;
  //     alienWarshipConf.height = gameBoard.board[r][c].height;
  //     // there are two sprite types for hovering aliens, and they alternate based on column position
  //     // also, they start with a different design on each row, like this;
  //     // 0 1 0 1 0
  //     // 1 0 1 0 1
  //     // so we calculate which design to assign based on the row and column, and store that in frame
  //     const frame = (r % 2 == 0) ? (c % 2 == 0 ? 0 : 1) : (c % 2 == 0 ? 1 : 0); 
  //     alienWarshipConf.sprite.sheet.startFrame = frame;
  //     gameBoard.board[r][c].gameObject = game.createObject(alienWarshipConf, spawnPos);
  //   }
  // }

  // alien fighters drop from rows (6-2) and may land on the player's capsule (row 1)
  // for (let r = 6; r > 1; r -= 1) {
  //   for (let c = 0; c < 5; c += 1) {
  //     const spawnPos = {
  //       x: gameBoard.board[r][c].x,
  //       y: gameBoard.board[r][c].y
  //     };
  //     const alienFighterConf = alienFighter;
  //     alienFighterConf.width = gameBoard.board[r][c].width;
  //     alienFighterConf.height = gameBoard.board[r][c].height;
  //     alienFighterConf.sprite.sheet.startFrame = c;
  //     gameBoard.board[r][c].gameObject = game.createObject(alienFighterConf, spawnPos);
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
  const playerObj = gameEngine.getObjectByType(player.type);
  if (playerObj) {
    if (playerObj.velocity.x !== 0) {

    }
    if (playerObj.velocity.y !==0) {

    }
  }
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
        selector: '#bgcanvas'
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
    hoverAliens: alienWarship,
    diveAliens: alienFighter,
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
