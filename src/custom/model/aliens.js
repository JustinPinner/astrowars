
import { CellBasedGameObject } from '../model/cellBasedGameObject';
import { AlienBomb } from '../model/projectiles';

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

class Alien extends CellBasedGameObject {
  constructor(conf, position, engine) {
    super(conf, position, engine);
  }
  get isAlien() {
    return true;
  }
  get isCommandShip() {
    return this.type == this.engine.config.commandShip.type;
  }
  get isWarship() {
    return this.type == this.engine.config.warship.type;
  }
  get isFighter() {
    return this.type == this.engine.config.fighter.type;
  }
  get pointsValue() {
    if (this.isCommandShip) {
      return 50;
    }
    if (this.isWarship) {
      return 20;
    }
    if (this.isFighter) {
      return 30;
    }
  }
} 

Alien.prototype.eventListener = function (thisObj, evt) {
  alienEventListener(thisObj, evt);
}

Alien.prototype.selectSprite = function(cell) {
  // find a sprite
  const alienType = this.type;
  const maybeSprite = this.sprites.filter(function(sprite) { return sprite.type == alienType; });
  if (maybeSprite && maybeSprite.length > 0) {
    this.sprite = maybeSprite[0];
  }

  if (this.sprite) {
    // calculate which frame
    switch (this.type) {
      case this.engine.config.commandShip.type : {
        this.sprite.frame = 0;
        break;
      }
      case this.engine.config.warship.type : {
        const frame = (cell.row % 2 == 0) ? (cell.column % 2 == 0 ? 0 : 1) : ( cell.column % 2 == 0 ? 1 : 0); 
        this.sprite.frame = frame;
        break;
      }
      case this.engine.config.fighter.type: {
        this.sprite.frame = cell.column;
        break;
      }
    }
  }
}

Alien.prototype.shoot = function() {
	// aliens can drop up to 3 bombs (betweenn all of them)
	const alienBomb = this.engine.getObjectsByType('bomb');
	if (!alienBomb || alienBomb.length < 3) {
    const bomb = new AlienBomb(this.engine);
    const launchPosition = {
			x: this.coordinates.x + (this.width / 2) - (bomb.width / 2), 
			y: this.coordinates.y
    };
    bomb.coordinates = launchPosition;
    this.engine.registerObject(bomb);
	}
}

export { 
  Alien
};
