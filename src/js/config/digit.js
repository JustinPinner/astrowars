// digit

import { digitFSMStates } from '../model/score';

export const digit = () => {
  return {
    type: 'digit',
    width: 55,
    height: 50,
    sprites: {
      digits: {
        sheet: {
          path: 'scoresheet.png',
          frameWidth: 62, 
          frameHeight: 85,
          rows: 1,
          columns: 10
        },	
        isDefault: true
      }
    },
    fsmStates: digitFSMStates,
    update: (digit) => {
      digit.fsm && digit.fsm.execute();
    }  
  }
};
