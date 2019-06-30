// phase

import { alienFSMStates } from '../behaviour/alienActions';

export const phase = (phase) => {
  switch (phase) {
    case 0: 
      return {
        name: 'demo',
        alienTotal: (alienType) => {
          return (alienType == 'warship') ? 4 : 3;
        },
        alienConcurrent: (alienType) => {
          return (alienType == 'warship') ? 4 : 3;
        },
        alienState: (alienType) => {
          const states = alienFSMStates();
          return (alienType == 'warship') ? states.strafe : states.idle;
        },
        interstitialAtEnd: true
      };
    case 1:
      return {
        name: 'assault',
        alienTotal: (alienType) => {
          return (alienType == 'warship') ? 30 : 3;
        },
        alienConcurrent: (alienType) => {
          return (alienType == 'warship') ? 5 : 3;
        },
        alienState: (alienType) => {
          const states = alienFSMStates();
          return (alienType == 'warship') ? states.hover : states.idle;
        },
        interstitialAtEnd: true
      };
    case 2:
      return {
        name: 'dive',
        alienTotal: (alienType) => {
          return (alienType == 'warship') ? 15 : 0;
        },
        alienConcurrent: (alienType) => {
          return (alienType == 'warship') ? 1 : 0;
        },
        alienState: (alienType) => {
          const states = alienFSMStates();
          return (alienType == 'warship') ? states.zigZagDive : states.idle;
        },
        interstitialAtEnd: true
      };
    case 3:
      return {
        name: 'command',
        alienTotal: (alienType) => {
          return (alienType == 'commandShip') ? 3 : 0;
        },
        alienConcurrent: (alienType) => {
          return (alienType == 'commandShip') ? 3 : 0;
        },
        alienState: (alienType) => {
          const states = alienFSMStates();
          return (alienType == 'commandShip') ? states.strafe : states.idle;
        },
        interstitialAtEnd: true
      };
    case 4: 
      return {
        name: 'bonus',
        alienTotal: () => {
          return 0;
        },
        alienConcurrent: () => {
          return 0;
        },
        interstitialAtEnd: true
      };
  }
};
