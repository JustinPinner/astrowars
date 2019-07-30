
import { GameBoard, Cell } from '../model/gameBoard';
import { PlayerCapsule, PlayerBase } from '../model/players';
import { Digit } from '../model/score';
import { Alien } from '../model/aliens';

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

const displayDigits = (gameEngine, intValue, displayLeadingZeroes = false) => {
  if (!gameEngine.gameBoard) {
    return;
  }
  const digitRow = 10;
  const stringNum = intValue.toString();
  const pad = gameEngine.gameBoard.columns - stringNum.length - 1;
  // display padding characters (maybe)
  if (displayLeadingZeroes) {
    for (let padCol = 0; padCol < pad; padCol += 1) {
      const cell = gameEngine.gameBoard.board[digitRow][padCol];
      const digit = (cell.contents[0] && cell.contents[0].isDigit) ? cell.contents[0] : cell.addObject(new Digit(
        gameEngine.config.digit,
        {
          x: cell.x, 
          y: cell.y
        },
        gameEngine  
      ));
      digit.value = 0;
    }
  }
  // display actual numbers
  for (let d=0; d < stringNum.length; d+=1) {
    const col = pad + d;
    const cell = gameEngine.gameBoard.board[digitRow][col];
    const digit = (cell.contents[0] && cell.contents[0].isDigit) ? cell.contents[0] : cell.addObject(new Digit(
      gameEngine.config.digit,
      {
        x: cell.x, 
        y: cell.y
      },
      gameEngine  
    ));
    digit.value = Number(stringNum.substr(d, 1));
  }
};

const showLevel = (gameEngine) => {
  displayDigits(gameEngine, gameEngine.config.game.level);
};

const showLives = (gameEngine) => {
  displayDigits(gameEngine, gameEngine.playerLives);
};

const showScore = (gameEngine) => {
  displayDigits(gameEngine, gameEngine.playerPoints);
};

const showBonus = (gameEngine) => {
  const withLeadingDigits = true;
  displayDigits(gameEngine, gameEngine.playerBonus, withLeadingDigits);
}

const spawnCommandShips = (gameEngine, qty) => {
  // command ships occupy the row below the score (9 by default)
  // in the first phase they don't do anything though, so don't include 
  // them in the count of aliens spawned
  const commandShipRow = gameEngine.gameBoard.rows - 2;
  const phase = gameEngine.config.game.phases(gameEngine.currentPhase);
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
    gameEngine.spawnedCommandShips = gameEngine.spawnedCommandShips ? gameEngine.spawnedCommandShips += 1 : 1; 
  }
};

const spawnWarships = (gameEngine, qty) => {
  // alien warships hang out on rows (8-7)
  const phase = gameEngine.config.game.phases(gameEngine.currentPhase);
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
    gameEngine.spawnedWarships = gameEngine.spawnedWarships ? gameEngine.spawnedWarships += 1 : 1; 
  }  
};

const spawnPlayerCapsule = (gameEngine) => {
  // prepare the player's starting row and column
  const playerCapsuleConfig = gameEngine.config.playerCapsule;
  const playerCapsuleRow = playerCapsuleConfig.startRow;
  let playerColumn;
  if (gameEngine.currentPhase != 4) {
    playerColumn = playerCapsuleConfig.startColumn;
  } else {
    const snp = gameEngine.snapshotLoad();
    const playerObjs = snp && snp.data && snp.data.gameObjects.filter(function(obj) {return obj.isPlayerCapsule});
    playerColumn = playerObjs && playerObjs.length > 0 ? playerObjs[0].currentCell.column : playerCapsuleConfig.startColumn;
  }
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
  if (gameEngine.currentPhase == 4 && !gameEngine.interstitial) {
    gameEngine.eventSystem.dispatchEvent(playerCapsule.id, {target: 'FSM', action: 'SET', state: playerCapsule.fsm.states.launch});
  }
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
  gameEngine.disposeAllObjects();
  // reset the gameboard
  initGameBoard(gameEngine);
  // reset score
  gameEngine.playerPoints = 0;
  // reset alien counts
  gameEngine.spawnedCommandShips = 0;
  gameEngine.spawnedWarships = 0;
  // reset player lives
  gameEngine.playerLives = 5;
};

const initDemoMode = (gameEngine) => {
  reset(gameEngine);
  gameEngine.currentPhase = 0;
  showLevel(gameEngine);
  spawnCommandShips(gameEngine);  
  spawnWarships(gameEngine);
};

const runInterstitial = (gameEngine) => {
  const beginNextPhase = 'BEGINNEXTPHASE';
  switch (gameEngine.currentPhase) {
    case 0:
      reset(gameEngine);
      gameEngine.interstitial = true;
      showLives(gameEngine);
      spawnPlayerBase(gameEngine);
      spawnPlayerCapsule(gameEngine);
      gameEngine.eventSystem.dispatchEvent(
        gameEngine.id, 
        {
          action: 'HOLD', 
          value: 3000, 
          onTimeUp: (engine) => {
            engine.interstitial = false;
            engine.eventSystem.dispatchEvent(engine.id, {action: beginNextPhase});
          }
        }
      );
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      const snp = gameEngine.snapshotSave();
      reset(gameEngine);
      gameEngine.interstitial = true;
      gameEngine.playerLives = snp.data.playerLives;
      showLives(gameEngine);
      spawnCommandShips(gameEngine);
      spawnPlayerBase(gameEngine);
      spawnPlayerCapsule(gameEngine);
      gameEngine.eventSystem.dispatchEvent(
        gameEngine.id, 
        {
          action: 'PAUSEOBJECTS'
        }
      );
      gameEngine.eventSystem.dispatchEvent(
        gameEngine.id, 
        {
          action: 'HOLD', 
          value: 3000, 
          onTimeUp: (engine) => {
            engine.restore();
            engine.interstitial = false;
            engine.eventSystem.dispatchEvent(engine.id, {action: beginNextPhase});
          }
        }
      );
      break;
  }
};

const nextPhase = (gameEngine) => {
  // testing specific phases from start...
  // if (gameEngine.currentPhase == 0) {
  //   gameEngine.currentPhase = 3;  // start as if phase 3 just ended
  // }
  const score = gameEngine.playerPoints;
  const phase = gameEngine.currentPhase;
  const lives = gameEngine.playerLives;
  reset(gameEngine);
  gameEngine.playerPoints = score;
  gameEngine.currentPhase = (phase > 3) ? 1: phase + 1;
  gameEngine.playerLives = lives;
  gameEngine.playerBonus = 0;
  showScore(gameEngine);
  spawnCommandShips(gameEngine);  
  spawnWarships(gameEngine);
  spawnPlayerCapsule(gameEngine);
  spawnPlayerBase(gameEngine);
};

export {
  showScore,
  showBonus,
  reset,
  initDemoMode,
  spawnWarships,
  spawnCommandShips,
  runInterstitial,
  nextPhase
}