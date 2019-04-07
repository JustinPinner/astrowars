import { onUpdateMissile, onUpdateBomb } from '../behaviour/projectileActions';
import { CellBasedGameObject } from './cellBasedGameObject';
import { Point2D } from '../../js/lib/2d';

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
        path: 'projectile.png',
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
  constructor(engineRef, position2d) {
    super(playerMissileConf, (position2d || new Point2D(0,0)), engineRef);
  }
}

const alienBombConf = {
  type: 'bomb',
  state: 'dropped',
  initialVelocity: {
    x: 0,
    y: 8
  },
  width: 6,
  height: 8,
  sprites: {
    alienBomb: {
      sheet: {
        path: 'projectile.png',
        frameWidth: 3,
        frameHeight: 4,
        rows: 1,
        columns: 1
      },
      isDefault: true    
    }
  },
  update: onUpdateBomb
};

class AlienBomb extends CellBasedGameObject {
  constructor(engineRef, position2d) {
    super(alienBombConf, (position2d || new Point2D(0,0)), engineRef);
  }
}

export { PlayerMissile, AlienBomb };
