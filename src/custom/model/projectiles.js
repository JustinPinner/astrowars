import { onUpdateMissile, onUpdateBomb } from '../behaviour/projectileActions';

const playerMissile = {
  type: 'missile',
  state: 'launched',
  initialVelocity: {
    x: 0,
    y: -8
  },
  width: 6,
  height: 8,
  sprite: {
    image: {
      path: 'player-missile.png',
      imageWidth: 3,
      imageHeight: 4
    }  
  },
  update: onUpdateMissile
};

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

export { playerMissile, alienBomb };
