// write alien behaviours here
// these functions will be bound into GameObject instances with .bind(this, this)
// so remember to change this.state if/when needed

const commandShipUpdate = (commandShipObject) => {
  // TODO
  // move left or right and drop bombs
  if (commandShipObject.engine.phase == 3) {
    // randomise left/right movement
    // drop a bomb?
    // repeat
  }
}

const warshipUpdate = (warshipObject) => {
  // TODO
  // move left or right if path clear and not at edge
  // [optionally] drop a bomb
};

const fighterUpdate = (fighterObject) => {
  // TODO
  // randomise downward path
  // [optionally] drop a bomb
};

export { commandShipUpdate, warshipUpdate, fighterUpdate };
