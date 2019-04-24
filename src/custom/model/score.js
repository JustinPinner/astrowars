import { CellBasedGameObject } from './cellBasedGameObject';

const stateNames = {
  scoreDigitFlash: 'scoreDigitFlash',
  scoreDigitOn: 'on'
};

const scoreDigitOnState = {
  name: stateNames.scoreDigitOn,
  nextStates: [stateNames.scoreDigitFlash],
  execute: (digit) => {
    digit.canDraw = true;
  }
};

const scoreDigitFlashState = {
  name: stateNames.scoreDigitFlash,
  nextStates: [stateNames.scoreDigitOn],
  minimumExecutionInterval: 500,
  minimumStateDuration: 5000,
  executeOnTransition: true,
  execute: (digit) => {
    if ((digit.fsm.currentState.minimumStateDuration || 0) <= digit.fsm.lastExecutionTime - digit.fsm.startTime) {
      // we've done our time, transition to next state
      digit.canDraw = true;
      digit.fsm.transition(digit.fsm.states[stateNames.scoreDigitOn]);
    }
    // invert drawable state
    digit.canDraw = !digit.canDraw;
  }
};

const scoreDigitFSMStates = () => {
  return {
    default: scoreDigitOnState,
    on: scoreDigitOnState,
    flash: scoreDigitFlashState  
  };
};

class ScoreDigit extends CellBasedGameObject {
  constructor(conf, position, engine) {
    super(conf, position, engine);
    this._val = 0;
  }
  get isScoreDigit() {
    return true;
  }
  get value() {
    return this._val;
  }
  set value(v) {
    this._val = v;
  }
}

ScoreDigit.prototype.selectSprite = function() {
	this.sprite = this.sprites[0];  
  this.sprite.frame = this._val;
}

export { 
  ScoreDigit,
  scoreDigitFSMStates,
};