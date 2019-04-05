import { onUpdateMissile, onUpdateBomb } from '../behaviour/projectileActions';
import { CellBasedGameObject } from './cellBasedGameObject';

const playerMissileConf = {
  type: 'missile',
  state: 'launched',
  initialVelocity: {
    x: 0,
    y: -8
  },
  width: 6,
  height: 8,
  sprites: {
    playerMissile: {
      sheet: {
        path: 'player-missile.png',
        frameWidth: 3,
        frameHeight: 4,
        rows: 1,
        columns: 1
      },
      isDefault: true  
    }
  },
  update: onUpdateMissile
};

class PlayerMissile extends CellBasedGameObject {
  constructor(position2d, engineRef) {
    super(playerMissileConf, position2d, engineRef);
  }
}

const alienBomb = {
  type: 'bomb',
  state: 'dropped',
  initialVelocity: {
    x: 0,
    y: 0
  },
  width: 6,
  height: 8,
  sprite: {
    image: {
      path: 'alien-bomb.png',
      imageWidth: 2,
      imageHeight: 4
    }  
  },
  update: onUpdateBomb
};

export { PlayerMissile, alienBomb };
