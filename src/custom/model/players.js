import { Keys } from '../../js/ui/keys';
import { onPlayerUpdate } from '../behaviour/playerActions';
import { playerMissile } from '../model/projectiles'
import GameObject from '../../js/model/gameObject';

const player = {
	type: 'player',
	state: 'live',
	initialVelocity: {
		x: 0,
		y: 0
	},
	width: 55,
	height: 50,
	sprites: {
		capsule: {
			sheet: {
				path: 'player-spritesheet.png',
				frameWidth: 55, 
				frameHeight: 50,
				rows: 1,
				columns: 5
			},	
			isDefault: true
		}
	},
	keys: {
		left: {
				keyCodes: [Keys.A, Keys.ARROWLEFT]
		},
		right: {
				keyCodes: [Keys.D, Keys.ARROWRIGHT]
		},
		thrust: {
				keyCodes: [Keys.W, Keys.ARROWUP]
		},
		fire: {
				keyCodes: [Keys.SPACE, Keys.ENTER],
				minInterval: 1000
		}
	},
	update: onPlayerUpdate
};

const followCapsuleState = {
  name: 'followState',
  nextStates: [stateNames.shot],
  detectCollisions: true,
  execute: (playerBase) => {
		const playerCapsule = playerBase.engine.getObjectByType(PlayerCapsule.type);
		if (playerCapsule && playerCapsule.currentCell && playerCapsule.currentCell.column != this.currentCell.column) {
			if (playerCapsule.currentCell.column < this.currentCell.column) {
				playerBase.moveLeft();
			} else {
				playerBase.moveRight();
			}
		}
  }
}

const scrollState = {
  name: 'followState',
  nextStates: [stateNames.shot],
  detectCollisions: true,
  execute: (playerBase) => {
    // move left/right
    // drop bomb maybe
  }
}


const playerBase = {
	type: 'playerBase',
	state: 'live',
	initialVelocity: {
		x: 0,
		y: 0
	},
	width: 55,
	height: 50,
	sprites: {
		base: {
			sheet: {
				path: 'player-base.png',
				frameWidth: 55, 
				frameHeight: 50,
				rows: 1,
				columns: 1,
			},	
			isDefault: true
		}
	},
	update: () => {}
}

class PlayerCapsule extends GameObject {
  constructor(position, engine) {
		super(player, position, engine);
		if (this.sprite) {
			this.sprite.frame = 2;
		}
	}
	get currentCell() {
		return this.engine.gameBoard.cellFromCoordinates(this.coordinates)[0][0];
	}	
}

PlayerCapsule.prototype.move = function(fromCell, toCell) {
	this.sprite = this.sprites.filter(function(sprite){return (sprite.fromRow || toCell.row) >= toCell.row && (sprite.toRow || toCell.row) <= toCell.row})[0];  
	this.sprite.frame = this.state == 'landing' ? toCell.column : 2;
	toCell.gameObject = this;
	this.coordinates.x = toCell.x;
	this.coordinates.y = toCell.y;
	fromCell.gameObject = {};
}

PlayerCapsule.prototype.moveLeft = function() {
  let maybeNeighbourCell = this.engine.gameBoard.cellNeighbour(this.currentCell, -1, 0);
  if (maybeNeighbourCell && maybeNeighbourCell.length > 0) {
		this.move(this.currentCell, maybeNeighbourCell[0][0]);
	}
}

PlayerCapsule.prototype.moveRight = function() {
  let maybeNeighbourCell = this.engine.gameBoard.cellNeighbour(this.currentCell, 1, 0);
  if (maybeNeighbourCell && maybeNeighbourCell.length > 0) {
		this.move(this.currentCell, maybeNeighbourCell[0][0]);
	}
}

PlayerCapsule.prototype.shoot = function() {
	// we can only fire one shot at a time
	const playerShot = this.engine.getObjectByType('missile');
	if (!playerShot) {
		const launchPosition = {
			x: this.coordinates.x + (this.width / 2) - (playerMissile.width / 2), 
			y: this.coordinates.y
		};
		this.engine.createObject(playerMissile, launchPosition);
	}
}	

class PlayerBase extends GameObject {
	constructor(position, engine) {
    super(playerBase, position, engine);
		if (this.sprite) {
			this.sprite.frame = 0;
		}
	}
}

PlayerBase.prototype.move = function(fromCell, toCell) {
	this.sprite = this.sprites.filter(function(sprite){return (sprite.fromRow || toCell.row) >= toCell.row && (sprite.toRow || toCell.row) <= toCell.row})[0];  
	this.sprite.frame = 0;
	toCell.gameObject = this;
	this.coordinates.x = toCell.x;
	this.coordinates.y = toCell.y;
	fromCell.gameObject = {};
}

export { PlayerCapsule, PlayerBase };
