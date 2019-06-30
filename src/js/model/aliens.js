
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
    // Command ships are always worth 100 pts but can only be hit during phase 3.
    // Warships 'hovering' are worth 10 in row 7 and 20 in row 8 
    // but if they're diving, they're worth 50 during phase 1 and 70 during pase 2.
    // However in the original game, the diving warship variant is sometomes only worth 
    // 40 pts during phase 1, but I can't quite pin down why that's the case, so 
    // I'm leaving those at 50 ¯\_(ツ)_/¯      
    let points = 0;
    const row = this.currentCell.row;
    const phase = this.engine.currentPhase;
    
    switch (this.type) {
      case this.engine.config.commandShip.type:
        if ( phase == 3 ) {
          points = 100;
        }
        break;
      case (this.engine.config.warship.type):
        switch (phase) {
          case 1: 
            points = row == 8 ? 20 : row == 7 ? 10 : 50;          
            break;
          case 2: 
            points = 70;
            break;
        }
        break;
    }
    return points;
  }
} 

Alien.prototype.eventListener = function (thisObj, evt) {
  alienEventListener(thisObj, evt);
}

Alien.prototype.selectSprite = function(cell) {
  // find a sprite
  const alienType = this.type;
//  const maybeSprite = this.sprites.filter(function(sprite) { return sprite.type == alienType; });
  const maybeSprite = this.sprites.filter(function(sprite) { return sprite.conf.sheet.fromRow <= cell.row && sprite.conf.sheet.toRow >= cell.row; });

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
      default:
        if (cell.row == 7 || cell.row == 8) {
          // draw as a hovering warship
          const frame = (cell.row % 2 == 0) ? (cell.column % 2 == 0 ? 0 : 1) : ( cell.column % 2 == 0 ? 1 : 0); 
          this.sprite.frame = frame;
        } else if (cell.row < 7 && cell.row > 1) {
          // draw as a diving fighter
          this.sprite.frame = cell.column;
        } else {
          // draw as a landed fighter
          const frame = cell.column % 2 == 0 ? 0 : 1; 
          this.sprite.frame = frame;
        }
        break;
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
			y: this.coordinates.y + (this.height / 2)
    };
    bomb.coordinates = launchPosition;
    this.engine.registerObject(bomb);
	}
}

export { 
  Alien
};
