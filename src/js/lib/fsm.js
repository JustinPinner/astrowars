
class FSM {
	constructor(host, states) {
    this.host = host;
    this.states = states;
    this.currentState = undefined;
    this.lastTransitionTime = undefined;
    this.lastExecutionTime = undefined;
    if (host) {
      host.engine.eventSystem.registerEvent(`${host.id}-FSMEvent`);
      host.engine.eventSystem.addEventListener(`${host.id}-FSMEvent`, this.eventListener.bind(this));
      host.engine.eventSystem.dispatchEvent(`${host.id}-FSMEvent`, { action: 'SET', state: this.states.default });
    }
  }
}

FSM.prototype.eventListener = function(evt) { 
  switch (evt.action) {
    case 'SET':
      this.setState(evt.state);
      break;
    case 'EXECUTE':
      if (evt.state && evt.state.execute) {
        evt.state.execute();
      } else {
        this.execute();
      }
      break;
    case 'TRANSITION':
      if (evt.state) {
        this.transition(evt.state);
      }
      break;
  }
}

FSM.prototype.execute = function() {
  this.lastExecutionTime = Date.now();
  if (!this.currentState) {
    this.currentState = (this.states.default ? this.states.default : undefined);
  } 
  if (this.host && this.currentState) {
		this.currentState.execute(this.host);
	}
}

FSM.prototype.setState = function(newState) {
  this.currentState = newState;
  this.lastTransitionTime = Date.now();
  this.lastExecutionTime = undefined;
}

FSM.prototype.transition = function(newState) {
  if (this.currentState && this.currentState.nextStates.includes(newState.name)) {
   this.setState(newState);
 }
 if (newState.executeOnTransition) {
   this.execute();
 }
}

export { FSM };