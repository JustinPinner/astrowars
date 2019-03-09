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

const alienEventListener = (alienObj, evt) => {
  console.log(`${alienObj.id} alienEventListener triggered by: ${evt.type} from: ${evt.source}`);
  switch (evt.type) {
    case 'hit':
      alienObj.fsm.transition(alienCommonFSMStates.shot);
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
  sprite: {
    sheet: {
      path: 'alien-saucer.png',
      frameWidth: 56, 
      frameHeight: 50,
      rows: 1,
      columns: 1 
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
  sprite: {
    sheet: {
      path: 'alien-hover-spritesheet.png',
      frameWidth: 58, 
      frameHeight: 50,
      rows: 1,
      columns: 2 
    }
  },
  fsmStates: alienWarshipFSMStates,
  update: alienWarshipUpdate
};

const alienFighterConf = {
  type: 'alienFighter',
  state: 'dive',
  initialVelocity: {
    x: 0,
    y: 0
  },
  width: 65,
  height: 60,
  sprite: {
    sheet: {
      path: 'alien-dive-spritesheet.png',
      frameWidth: 65, 
      frameHeight: 60,
      rows: 1,
      columns: 5 
    }
  },
  fsmStates: alienFighterFSMStates,
  update: alienFighterUpdate
};

class Alien extends GameObject {
  constructor(conf, position, engine) {
    super(conf, position, engine);
  }
}

Alien.prototype.eventListener = function (self, eventArgs) {
  console.log(`${this.id} Alien eventListener triggered`);
  alienEventListener(self, eventArgs);
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

class AlienFighter extends Alien {
  constructor(conf, position, engine) {
    const config = conf ? conf : alienFighterConf
    super (config, position, engine);
  }
}

export { 
  AlienCommandShip,
  alienCommandShipConf,
  AlienWarship,
  alienWarshipConf, 
  AlienFighter,
  alienFighterConf 
};
