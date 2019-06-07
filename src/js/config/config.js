
import { game } from './game';
import { digit } from './digit';
import { playerCapsule, playerBase } from './player';
import { commandShip, warship, fighter } from './alien';

class Config {
  constructor(customLifecycle) {
    this._game = game();
    this._game.lifeCycle = {
      onSetup: customLifecycle.onSetup,
      onStart: customLifecycle.onStart,
      onTick: customLifecycle.onTick
    };
  };
  get game() {
    return this._game;
  };
  get digit() {
    return digit();
  };
  get playerCapsule() {
    return playerCapsule();
  };
  get playerBase() {
    return playerBase();
  };
  get commandShip() {
    return commandShip();
  };
  get warship() {
    return warship();
  };
  get fighter() {
    return fighter();
  };
  get phases() {
    return this._game.phases;
  };
}

export {
  Config
};
