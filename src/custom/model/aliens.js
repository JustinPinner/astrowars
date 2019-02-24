import { commandShipUpdate, warshipUpdate, fighterUpdate } from '../behaviour/alienActions';

const alienFighter = {
  type: 'alien',
  state: 'dive',
  initialVelocity: {
    x: 0,
    y: 0
  },
  width: 65,
  height: 60,
  sprite: {
    sheet: {
      path: 'alien-dive-spritesheet.png',
      frameWidth: 65, 
      frameHeight: 60,
      rows: 1,
      columns: 5 
    }
  },
  update: fighterUpdate
};

const alienWarship = {
  type: 'alien',
  state: 'hover',
  initialVelocity: {
    x: 0,
    y: 0
  },
  width: 58,
  height: 50,
  sprite: {
    sheet: {
      path: 'alien-hover-spritesheet.png',
      frameWidth: 58, 
      frameHeight: 50,
      rows: 1,
      columns: 2 
    }
  },
  update: warshipUpdate
};

const alienCommandShip = {
  type: 'alien',
  state: 'saucer',
  initialVelocity: {
    x: 0,
    y: 0
  },
  width: 56,
  height: 50,
  sprite: {
    sheet: {
      path: 'alien-saucer.png',
      frameWidth: 56, 
      frameHeight: 50,
      rows: 1,
      columns: 1 
    }
  },
  update: commandShipUpdate
}

export { alienCommandShip, alienWarship, alienFighter };
