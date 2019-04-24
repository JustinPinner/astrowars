
import { PlayerMissile } from '../model/projectiles';
import { CellBasedGameObject } from '../model/cellBasedGameObject';

const playerCapsuleEventListener = (thisObj, evt) => {
  if (evt.target && evt.target == 'FSM' && evt.state) {
    if (evt.action && evt.action == 'SET') {
      thisObj.fsm.setState(evt.state);  
    } else {
      thisObj.fsm.transition(evt.state);
    }  
  } else {
    switch (evt.action) {
      case 'DIE':
        thisObj.fsm.transition(thisObj.fsm.states.capsuleHit)
        break;
      default:
        break;      
    }  
  }
};

class Player extends CellBasedGameObject {
  constructor(conf, position, engine) {
    super(conf, position, engine);
  }
  get isPlayer() {
    return true;
  }
}

class PlayerCapsule extends Player {
  constructor(conf, position, engine) {
		super(conf, position, engine);
		if (this.sprite) {
			this.sprite.frame = 2;
		}
  }
  get isPlayerCapsule() {
    return true;
  }
}

PlayerCapsule.prototype.eventListener = function (thisObj, evt) {
  playerCapsuleEventListener(thisObj, evt);
}

PlayerCapsule.prototype.selectSprite = function(cell) {
	this.sprite = this.sprites.filter(function(sprite){return (sprite.fromRow || cell.row) >= cell.row && (sprite.toRow || cell.row) <= cell.row})[0];  
	this.sprite.frame = this.state == 'landing' ? cell.column : 2;
}

PlayerCapsule.prototype.shoot = function() {
	// we can only fire one shot at a time
	const playerShot = this.engine.getObjectByType('missile');
	if (!playerShot) {
    const missile = new PlayerMissile(this.engine);
    const launchPosition = {
			x: this.coordinates.x + (this.width / 2) - (missile.width / 2), 
			y: this.coordinates.y
    };
    missile.coordinates = launchPosition;
    this.engine.registerObject(missile);
    this.engine.eventSystem.dispatchEvent(this.engine.id, {action: 'PLAYSOUND', value: (this.conf.soundEffects ? this.conf.soundEffects['shoot'] : engine.defaultSoundEffects['shoot'])});
	}
}	

const playerBaseEventListener = (thisObj, evt) => {
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

class PlayerBase extends Player {
	constructor(conf, position, engine) {
    super(conf, position, engine);
		if (this.sprite) {
			this.sprite.frame = 0;
		}
  }
  get isPlayerBase() {
    return true;
  }
}

PlayerBase.prototype.eventListener = function (thisObj, evt) {
  playerBaseEventListener(thisObj, evt);
}

PlayerBase.prototype.selectSprite = function(cell) {
	this.sprite = this.sprites.filter(function(sprite){return (sprite.fromRow || cell.row) >= cell.row && (sprite.toRow || cell.row) <= cell.row})[0];  
	this.sprite.frame = 0;
}

export { 
  PlayerCapsule, 
  PlayerBase 
};
