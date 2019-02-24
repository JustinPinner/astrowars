import { Keys } from '../../js/ui/keys';
import { onUpdate } from '../behaviour/playerActions';

const player = {
	type: 'player',
	state: 'live',
	initialVelocity: {
		x: 0,
		y: 0
	},
	width: 55,
	height: 50,
	sprite: {
		sheet: {
			path: 'player-spritesheet.png',
			frameWidth: 55, 
			frameHeight: 50,
			rows: 1,
			columns: 5,
			startFrame: 2
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
	update: onUpdate
};

const playerBase = {
	type: 'playerBase',
	state: 'live',
	initialVelocity: {
		x: 0,
		y: 0
	},
	width: 55,
	height: 50,
	sprite: {
		sheet: {
			path: 'player-base.png',
			frameWidth: 55, 
			frameHeight: 50,
			rows: 1,
			columns: 1,
			startFrame: 0
		}
	},
	update: () => {}
}

export { player, playerBase };
