# astrowars

Grandstand's 80s tabletop classic revisited

Built for (and to test) my [EccentricEngine](https://github.com/JustinPinner/EccentricEngine) JS game engine

![Alt Text](https://github.com/JustinPinner/astrowars/blob/master/AstroWars3.gif)

To get started, either clone the [EccentricEngine repo](https://github.com/JustinPinner/EccentricEngine) OR install it from the npm package registry by running `npm -i eccentric-engine`

If you chose to clone the [EccentricEngine repo](https://github.com/JustinPinner/EccentricEngine) instead of installing from npm, you'll need to make sure to comment out all the `import { Something } from 'eccentric-engine/Engine';` statements (run a global search in your editor for `from 'eccentric-engine/Engine'`) and change the relative path statements to match your local directory structure, e.g.
`import { Something } from '../your/path/to/EccentricEngine/src/engine/engine';`

## Versions

1.0.2
=====
* Uses updated (v1.0.3) [EccentricEngine](https://github.com/JustinPinner/EccentricEngine)
* Adds initial implementation of bonus phase gameplay
* Added string padding for displaying score and bonus digits
* Added game-over condition
* Added engine debugging option - add a `?debug` search parameter to the game URL to activate logging to your browser's dev console
* Added game clocking mechanism - if you score over 99999 points you'll get extra lives
* Removed some hardcoded strings for game phase checks
* Added a `playerObjects` getter to `AWEngine` to simplify extracting player objects from EccentricEngine's `gameObjects` collection
