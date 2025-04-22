/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 */

/* wle:auto-imports:start */
import {KeyboardController as KeyboardController1} from './components/input/keyboard-controller.js';
import {Tags} from '@sorskoot/wonderland-components';
import {GameRoot} from './components/game-controller.js';
import {MapLoader} from './components/map-loader.js';
import {PlayerController} from './components/player-controller.js';
import {PlayerFollow} from './components/player-follow.js';
import {TargetAnimator} from './components/target-animator.js';
import {MainUI} from './ui/main-ui.tsx';
/* wle:auto-imports:end */

export default function(engine) {
/* wle:auto-register:start */
engine.registerComponent(KeyboardController1);
engine.registerComponent(Tags);
engine.registerComponent(GameRoot);
engine.registerComponent(MapLoader);
engine.registerComponent(PlayerController);
engine.registerComponent(PlayerFollow);
engine.registerComponent(TargetAnimator);
engine.registerComponent(MainUI);
/* wle:auto-register:end */
}
