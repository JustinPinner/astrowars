import { CellBasedGameObject } from './cellBasedGameObject';

const stateNames = {
  digitFlash: 'digitFlash',
  digitOn: 'on'
};

const digitOnState = {
  name: stateNames.digitOn,
  nextStates: [stateNames.digitFlash],
  execute: (digit) => {
    digit.canDraw = true;
  }
};

const digitFlashState = {
  name: stateNames.digitFlash,
  nextStates: [stateNames.digitOn],
  minimumExecutionInterval: 500,
  minimumStateDuration: 5000,
  executeOnTransition: true,
  execute: (digit) => {
    if ((digit.fsm.currentState.minimumStateDuration || 0) <= digit.fsm.lastExecutionTime - digit.fsm.startTime) {
      // we've done our time, transition to next state
      digit.canDraw = true;
      digit.fsm.transition(digit.fsm.states[stateNames.digitOn]);
    }
    // invert drawable state
    digit.canDraw = !digit.canDraw;
  }
};

const digitFSMStates = () => {
  return {
    default: digitOnState,
    on: digitOnState,
    flash: digitFlashState  
  };
};

class Digit extends CellBasedGameObject {
  constructor(conf, position, engine) {
    super(conf, position, engine);
    this._val = 0;
  }
  get isDigit() {
    return true;
  }
  get value() {
    return this._val;
  }
  set value(v) {
    this._val = v;
  }
}

Digit.prototype.selectSprite = function() {
	this.sprite = this.sprites[0];  
  this.sprite.frame = this._val;
}

export { 
  Digit,
  digitFSMStates,
};