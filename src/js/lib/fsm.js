
class FSM {
	constructor(host, states) {
    this.host = host;
    this.states = states;
    this.currentState = undefined;
    this.lastTransitionTime = undefined;
    this.lastExecutionTime = undefined;
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
  const now = Date.now();
  if (!this.host) {
    // Wut?!
    return;
  }
  if (!this.currentState) {
    this.currentState = (this.states.default ? this.states.default : undefined);
  } 
  if (this.host && this.currentState && this.currentState.execute) {
    if ((this.lastExecutionTime || 0) + (this.currentState.minimumExecutionInterval || 0) <= now) {
      this.lastExecutionTime = now;
      this.currentState.execute(this.host);
    }
	}
}

FSM.prototype.setState = function(newState) {
  if (!this.host) {
    return;
  }
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