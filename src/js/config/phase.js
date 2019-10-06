// phase

import { alienFSMStates } from '../behaviour/alienActions';

const phases = {
  'gameover': {
    'id': -1,
    'name': 'GameOver'
  },
  'demo': {
    'id': 0,
    'name': 'Demo'
  },
  'assault': {
    'id': 1,
    'name': 'Assault'
  },
  'dive': {
    'id': 2,
    'name': 'Dive'
  },
  'command': {
    'id': 3,
    'name': 'Dive'
  },
  'bonus': {
    'id': 4,
    'name': 'Bonus'
  }
};

export const phase = (phaseId) => {
  if (phaseId == undefined || isNaN(phaseId)) {
    return phases;
  }
  switch (phaseId) {
    case phases.demo.id: 
      return {
        name: phases.demo.name,
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
    case phases.assault.id:
      return {
        name: phases.assault.name,
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
    case phases.dive.id:
      return {
        name: phases.dive.name,
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
    case phases.command.id:
      return {
        name: phases.command.name,
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
    case phases.bonus.id: 
      return {
        name: phases.bonus.name,
        alienTotal: () => {
          return 0;
        },
        alienConcurrent: () => {
          return 0;
        },
        interstitialAtEnd: true
      };
    case phases.gameover.id:
      return {
        name: phases.gameover.name,
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
