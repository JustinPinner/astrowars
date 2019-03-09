import { onUpdateMissile, onUpdateBomb } from '../behaviour/projectileActions';

const playerMissile = {
  type: 'missile',
  state: 'launched',
  initialVelocity: {
    x: 0,
    y: -8
  },
  width: 3,
  height: 4,
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
  width: 2,
  height: 4,
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
