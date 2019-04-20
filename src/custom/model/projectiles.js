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

class Projectile extends CellBasedGameObject {
  constructor(engineRef, conf, position2d) {
    super(conf, (position2d || new Point2D(0,0)), engineRef);
  }
  get isProjectile() {
    return true;
  }
}

class PlayerMissile extends Projectile {
  constructor(engineRef, position2d) {
    super(engineRef, playerMissileConf, (position2d || new Point2D(0,0)));
  }
}

const alienBombConf = {
  type: 'bomb',
  state: 'dropped',
  initialVelocity: {
    x: 0,
    y: 6
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

class AlienBomb extends Projectile {
  constructor(engineRef, position2d) {
    super(engineRef, alienBombConf, (position2d || new Point2D(0,0)));
  }
}

export { PlayerMissile, AlienBomb };
