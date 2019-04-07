
import { PlayerMissile } from '../model/projectiles';
import { CellBasedGameObject } from '../model/cellBasedGameObject';
import { Point2D } from '../../js/lib/2d';

class PlayerCapsule extends CellBasedGameObject {
  constructor(conf, position, engine) {
		super(conf, position, engine);
		if (this.sprite) {
			this.sprite.frame = 2;
		}
	}
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

class PlayerBase extends CellBasedGameObject {
	constructor(conf, position, engine) {
    super(conf, position, engine);
		if (this.sprite) {
			this.sprite.frame = 0;
		}
	}
}

PlayerBase.prototype.eventListener = function (thisObj, evt) {
  playerBaseEventListener(thisObj, evt);
}

PlayerBase.prototype.selectSprite = function(cell) {
	this.sprite = this.sprites.filter(function(sprite){return (sprite.fromRow || cell.row) >= cell.row && (sprite.toRow || cell.row) <= cell.row})[0];  
	this.sprite.frame = 0;
}

export { PlayerCapsule, PlayerBase };
