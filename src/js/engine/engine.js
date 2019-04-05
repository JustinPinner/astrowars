const uuidv4 = require('uuid/v4');
import Reactor from '../lib/events';
import Canvas2D from '../environment/canvas';
import { TouchInterface, TouchHandler } from '../ui/touch';
import KeyHandler from '../ui/keys';
import GamepadHandler from '../ui/gamepad';
import partition from '../lib/partition';
import GameObject from '../model/gameObject';
import ImageService from '../utils/image';

// default gameConfig object
class DefaultConfig {
  constructor() {
    const _game = _gameConfig;
    _game.lifeCycle = {
      onSetup: onSetup,
      onStart: onStart,
      onTick: onTick
    }
    this.gameConfig = _game;
    this.alienConfig = _alienConfig;
  };
  get game() {
    return {
      version: 0.0,
      fps: 60,
      canvasses: {},
      touchUI: {},
      enableTouchUI: 'auto',
      enableKeyboardUI: false,
      enableGamepadUI: false,
      lifeCycle: {
        setup: () => { return true; },
        start: () => { return true; },
        tick: () => { return true; }
      }
    };
  }
}

class Engine {
  constructor(customConfig, customLifecycle) {
    this.eventSystem = new Reactor();
    this.config = (customConfig && new customConfig(customLifecycle)) || new DefaultConfig;
    this.images = new ImageService();
    this.onSetup = this.config.game.lifeCycle.onSetup;
    this.onStart = this.config.game.lifeCycle.onStart;
    this.onTick = this.config.game.lifeCycle.onTick;
    this.player = null;
    this.loggedEvents = [];
    this.ticks = 0;   
    this.hasTouchSupport = (window.navigator && window.navigator.maxTouchPoints > 0);
    this.gameObjects = [];
    this.canvasses = [];
    this.keyHandler = this.config.game.enableKeyboardUI ? new KeyHandler(this.config.game.keyProcessor) : undefined;
    this.gamepadHandler = this.config.game.enableGamepadUI ? new GamepadHandler() : undefined;
    this.touchHandler = (this.config.game.enableTouchUI === true || this.config.game.enableTouchUI === 'auto' && this.hasTouchSupport) ? new TouchHandler(this.config.game.touchUI) : undefined;
    this.timing = {};
    for (const cnv in this.config.game.canvasses) {
      const canvas = new Canvas2D(this.config.game.canvasses[cnv], this);
      if (canvas) {
        this.canvasses.push(canvas);
      }
    }    
    // default canvas if none sent in config
    if (this.canvasses.length < 1) {
      const canvas = new Canvas2D({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        wrapper: {
          selector: '#canvasdiv',
          style: {
            backgroundColour: '#000000',
          }
        },
        canvas: {
          selector: '#canvas',
        },
        alias: 'canvas',  
      }, this);
      this.canvasses.push(canvas);
    }
  }

  /* getters */

  get isReady() {
    return this.canvasses.filter(function(canvas){return canvas.isReady;}).length == this.canvasses.length;
  }

  // get localPlayer() {
  //   return this._localPlayer;
  // }

  // get maxSpawnDistanceX() {
  //   return (this.canvas('viewport').width / 2) * MAX_SPAWN_SCREENS_WIDE;
  // }

  // get maxSpawnDistanceY() {
  //   return (this.canvas('viewport').height / 2) * MAX_SPAWN_SCREENS_HIGH;
  // }

  // get despawnRange() {
  //   const maxX = this.maxSpawnDistanceX * 2;
  //   const maxY = this.maxSpawnDistanceY * 2
  //   return Math.sqrt((maxX * maxX)+(maxY * maxY));
  // }

  get objects() {
    return this.gameObjects;
  }

  // get keys() {
  //   return this.keyHandler;
  // }

  get gamepad() {
    return this.gamepadHandler.gamepad;
  }

  // get touch() {
  //   return this.hasTouchSupport;
  // }

  // get touchHandler() {
  //   return this.hasTouchSupport && this._touchInterface.touchHandler;
  // }

  /* setters */

  set localPlayer(player) {
    this.player = player;
  }
  
}

Engine.prototype.timerStart = function(identity) {
  const now = Date.now();
  if (!this.timing[identity]) {
    this.timing[identity] = {};
  }
  const lastTime = (this.timing[identity] && this.timing[identity].last) ? this.timing[identity].last : now;
  const interval = now - lastTime;
  this.timing[identity].last = now;
  this.timing[identity].interval = interval;
}

Engine.prototype.timerStop = function(identity) {
  const now = Date.now();
  if (!this.timing[identity]) {
    return;
  }
  const lastTime = this.timing[identity].last;
  this.timing[identity].duration = now - lastTime;
}

Engine.prototype.canvas = function(alias) {
  const canvs = this.canvasses.filter(function(canvas){return canvas.alias === alias;});
  return (canvs.length > 0) ? canvs[0] : undefined;  
}

Engine.prototype.refreshUi = function() {
  for (const cnv in this.canvasses) {
    this.canvasses[cnv].draw();
  }
}

Engine.prototype.createObject = function(conf, position) {
  const gameObject = new GameObject(conf, position, this);
  // this.gameObjects.push(gameObject);
  return gameObject;  
}

Engine.prototype.registerObject = function(gameObject) {
  if (!gameObject.id) {
    gameObject.id = uuidv4();  
  }
  if (this.getObjectById(gameObject.id)) {
    // object exists
    return false;
  }
  this.gameObjects.push(gameObject);
  return true;
}

Engine.prototype.getObjectById = function(id) {
  const objs = this.getObjectsById(id);
  return (objs && objs.length > 0) ? objs[0] : undefined;
}

Engine.prototype.getObjectsById = function(id) {
  const objs = this.gameObjects.filter(function(obj) {return obj.id === id});
  return (objs.length > 0) ? objs : undefined;
}

Engine.prototype.getObjectByType = function(type) {
  const objs = this.getObjectsByType(type);
  return (objs && objs.length > 0) ? objs[0] : undefined;
}

Engine.prototype.getObjectsByType = function(type) {
  const objs = this.gameObjects.filter(function(obj) {return obj.type === type});
  return (objs.length > 0) ? objs : undefined;
}

Engine.prototype.filterObjects = function(objectTypeOrTypes) {
  if (objectTypeOrTypes) {
    return this.objects.filter(function(obj) {
      return objectTypeOrTypes instanceof Array ? 
        objectTypeOrTypes.includes(obj.constructor) : 
        obj instanceof objectTypeOrTypes;
    })
  }
  return this.objects;
}

Engine.prototype.log = function(loggedEvent) {
  this.loggedEvents.push(loggedEvent.dump);
}

Engine.prototype.flushLoggedEvents = function() {
  for (let ev=0; ev < this.loggedEvents.length; ev += 1) {
    console.log(this.loggedEvents[ev]);
  }
  this.loggedEvents = [];
}

Engine.prototype.setup = function() {
  if (this.setupDone) return; 

  this.timerStart('setup');

  this.onSetup.bind(this, this);
  this.onStart.bind(this, this);
  this.onTick.bind(this, this);
  
  for (goType in this.config.gameObjectTypes) {
    for (objDef in this.config.gameObjectTypes[goType]) {
      const gameObject = this.config.gameObjectTypes[goType][objDef];
      sourceImagePath = gameObject.sprite.sheet ? gameObject.sprite.sheet.path : gameObject.sprite.image.path;
      this.images.load(sourceImagePath);  
    }
  }
  
  for(const cnv in this.canvasses) {
    this.canvasses[cnv].init && this.canvasses[cnv].init();
  }
  
  if (this.config.enableTouchUI && this.hasTouchSupport) {
    this.touchInterface.init();
  }
  this.timerStart('onSetup');
  this.onSetup(this);
  this.timerStop('onSetup');

  this.setupDone = true;
  this.timerStop('setup');
}

Engine.prototype.start = function() {
  this.timerStart('start');
 
  if (this.started) return true;

  this.setup();
  window.addEventListener('keydown', this.keyHandler.handleKeyDown.bind(this.keyHandler), false);
  window.addEventListener('keyup', this.keyHandler.handleKeyUp.bind(this.keyHandler), false);    
  for (const cnv in this.canvasses) {
    this.canvasses[cnv].init();
  }
  
  // run custom user code
  this.timerStart('onStart');
  this.onStart(this);
  this.timerStop('onStart');
  
  requestAnimationFrame(this.tick.bind(this));
  
  this.started = true;
  this.timerStop('start');
}

Engine.prototype.tick = function() {
  if (!this.isReady) {
    return;
  }
  this.timerStart('tick');
  this.ticks += 1;

  this.refreshUi();

  const deadAndAlive = partition(this.gameObjects, function(obj) {
    return obj.TTL ? obj.TTL <= 0 : obj.disposable;
  });
  this.gameObjects = deadAndAlive[1];
  for (const obj in this.gameObjects) {
    const gameObject = this.gameObjects[obj];
    if (gameObject.TTL && gameObject.TTL > 0) {
      const now = Date.now();
      if (!gameObject.lastTTLTick || (gameObject.lastTTLTick && now - gameObject.lastTTLTick >= 1000)) {
        gameObject.lastTTLTick = Date.now();
        gameObject.TTL -= 1;
        if (gameObject.TTL <= 0) {
          gameObject.disposable = true;
        }
      }
    }
    gameObject.update();
    gameObject.draw();
  }

  // run custom user code
  this.timerStart('onTick');
  this.onTick(this);
  this.timerStop('onTick');

  this.timerStop('tick');

  setInterval(requestAnimationFrame(this.tick.bind(this)), 1000/this.config.fps);  
}

export default Engine;
  