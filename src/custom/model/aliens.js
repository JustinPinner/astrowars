import { 
  alienCommandShipUpdate, 
  alienWarshipUpdate, 
  alienFighterUpdate,
  alienCommonFSMStates,
  alienCommandShipFSMStates, 
  alienFighterFSMStates, 
  alienWarshipFSMStates 
} from '../behaviour/alienActions';

import GameObject from '../../js/model/gameObject';

const alienEventListener = (thisObj, evt) => {
  switch (evt.action) {
    case 'SET':
      thisObj.fsm.setState(evt.state);
      break;
    case 'TRANSITION':
      thisObj.fsm.transition(evt.state);
      break;
    default:
      break;      
  }
};

const alienCommandShipConf = {
  type: 'alienCommandShip',
  state: 'saucer',
  initialVelocity: {
    x: 0,
    y: 0
  },
  width: 56,
  height: 50,
  sprites: {
    default: {
      sheet: {
        path: 'alien-commandship.png',
        frameWidth: 56, 
        frameHeight: 50,
        rows: 1,
        columns: 1,
        fromRow: 9,
        toRow: 9 
      }
    }
  },
  update: alienCommandShipUpdate,
  fsmStates: alienCommandShipFSMStates
};

const alienWarshipConf = {
  type: 'alienWarship',
  state: 'hover',
  initialVelocity: {
    x: 0,
    y: 0
  },
  width: 58,
  height: 50,
  sprites: {
    hover: {
      sheet: {
        path: 'alien-hover-spritesheet.png',
        frameWidth: 58, 
        frameHeight: 50,
        rows: 1,
        columns: 2,
        fromRow: 7,
        toRow: 8 
      }  
    },
    dive: {
      sheet: {
        path: 'alien-dive-spritesheet.png',
        frameWidth: 65, 
        frameHeight: 60,
        rows: 1,
        columns: 5,
        fromRow: 2,
        toRow: 6 
      }  
    }
  },
  fsmStates: alienWarshipFSMStates,
  update: alienWarshipUpdate
};

// const alienFighterConf = {
//   type: 'alienFighter',
//   state: 'dive',
//   initialVelocity: {
//     x: 0,
//     y: 0
//   },
//   width: 65,
//   height: 60,
//   sprite: {
//     default: {
//       sheet: {
//         path: 'alien-dive-spritesheet.png',
//         frameWidth: 65, 
//         frameHeight: 60,
//         rows: 1,
//         columns: 5 
//       }  
//     }
//   },
//   fsmStates: alienFighterFSMStates,
//   update: alienFighterUpdate
// };

class Alien extends GameObject {
  constructor(conf, position, engine) {
    super(conf, position, engine);
  }
  get isCommandShip() {
    return this.type == alienCommandShipConf.type;
  }
  get isWarship() {
    return this.type == alienWarshipConf.type;
  }
  get isFighter() {
    return this.type == alienFighterConf.type;
  }
}

Alien.prototype.eventListener = function (thisObj, evt) {
  alienEventListener(thisObj, evt);
}

Alien.prototype.moveToCell = function (cell) {
  const maybeCurrentCell = this.engine.gameBoard.cellFromCoordinates(this.coordinates);
  if (!maybeCurrentCell) {
    console.log(`Live alien (${this.id}) without an address :(`);
    return;
  }
  const currentCell = maybeCurrentCell[0][0];
  // update image to draw based on row/col position
  const frame = (currentCell.row % 2 == 0) ? (currentCell.column % 2 == 0 ? 0 : 1) : (currentCell.column % 2 == 0 ? 1 : 0); 
  this.sprite = this.sprites.filter(function(sprite){return (sprite.fromRow || currentCell.row) >= currentCell.row && (sprite.toRow || currentCell.row) <= currentCell.row})[0];  
  this.sprite.frame = frame;
  cell.gameObject = this;
  this.coordinates.x = cell.x;
  this.coordinates.y = cell.y;
  currentCell.gameObject = {};
}

class AlienCommandShip extends Alien {
  constructor(conf, position, engine) {
    const config = conf ? conf : alienCommandShipConf
    super (config, position, engine);
  }
}

class AlienWarship extends Alien {
  constructor(conf, position, engine) {
    const config = conf ? conf : alienWarshipConf
    super (config, position, engine);
  }
}

// class AlienFighter extends Alien {
//   constructor(conf, position, engine) {
//     const config = conf ? conf : alienFighterConf
//     super (config, position, engine);
//   }
// }

export { 
  AlienCommandShip,
  alienCommandShipConf,
  AlienWarship,
  alienWarshipConf, 
  // AlienFighter,
  // alienFighterConf 
};
