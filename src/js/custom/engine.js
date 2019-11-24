// If you cloned the EccentricEngine github repo at https://github.com/JustinPinner/EccentricEngine
// (which is much better for examining the code) import it from wherever you cloned it to, e.g. 
// for *nix / OSX etc
// import { Engine } from '~/code/projects/EccentricEngine/src/engine/engine';
// for Windows
// import { Engine } from 'c:/projects/EccentricEngine/src/engine/engine';

// But if you ran npm install eccentric-engine, do it like this
import { Engine } from 'eccentric-engine/Engine';
// import { Engine } from '../../../../EccentricEngine/src/engine/engine';

class AWEngine extends Engine {
  constructor(cfg, lfcyc) {
    super(cfg, lfcyc);
    this.snapshots = [];
    // this.timers = new TimerSystem(this);
    this.playerPoints = 0;
    this.playerLives = 0;
    this.currentPhase = 0;
    this.playerBonus = 0;
  }
  get playerCapsule() {
    const capsuleObjs = this.gameObjects.filter(function(obj) { return obj.isPlayerCapsule; });
    return capsuleObjs && capsuleObjs.length > 0 && capsuleObjs[0];
  }
  get playerBase() {
    const baseObjs = this.gameObjects.filter(function(obj) { return obj.isPlayerBase; });
    return baseObjs && baseObjs.length > 0 && baseObjs[0];  
  }
  get playerObjects() {
    const capsule = this.playerCapsule;
    const base = this.playerBase;
    return [capsule, base];
  }
}

AWEngine.prototype.disposeAllObjects = function() {
  for (const obj in this.gameObjects) {
    this.gameObjects[obj].disposable = true;
  }
}

AWEngine.prototype.snapshotSort = function(descending) {
  // snapshots should be treated as a LIFO stack: the latest save is always at element [0]
  this.snapshots = this.snapshots.sort(function compare(a, b) {
    if (a.time < b.time) {
      return descending ? 1 : -1;
    }
    if (a.time > b.time) {
      return descending ? 1 : -1;
    }
    return 0;
  })  
}

AWEngine.prototype.snapshotSave = function() {
  const currentData = {
    phase: this.currentPhase,
    gameObjects: this.gameObjects,
    gameBoard: this.gameBoard,
    playerPoints: this.playerPoints,
    playerLives: this.playerLives,
    spawnedCommandShips: this.spawnedCommandShips,
    spawnedWarships: this.spawnedWarships
  }
  
  const snp = {
    time: Date.now(),
    data: currentData
  };

  this.snapshots.push(snp);
  this.snapshotSort();
  return snp;
}

AWEngine.prototype.snapshotLoad = function(time) {
  // check we've got something to load
  if (this.snapshots.length == 0) {
    return undefined;
  }
  return time 
    ? this.snapshots.partition(function(snp) { return snp.time == time; })[0]
    : this.snapshots[0];
}

AWEngine.prototype.restore = function() {
  const snp = this.snapshotLoad();
  if (snp) {
    this.currentPhase = snp.data.phase;
    this.gameObjects = snp.data.gameObjects;
    this.gameBoard = snp.data.gameBoard;
    this.playerLives = snp.data.playerLives;
    this.playerPoints = snp.data.playerPoints;
    this.spawnedCommandShips = snp.data.spawnedCommandShips;
    this.spawnedWarships = snp.data.spawnedWarships;  
  }
}

export {
  AWEngine
};
