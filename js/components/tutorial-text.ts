import {
    Component,
    Material,
    Object3D,
    TextComponent,
} from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { GlobalEvents } from '../classes/GlobalEvents.js';

/**
 * Component for displaying tutorial text that changes material based on dimension
 * Used to show hints and instructions to the player that adapt to the current dimension
 */
export class TutorialText extends Component {
    static TypeName = 'tutorial-text';

    /**
     * Material to use when in the light dimension
     */
    @property.material()
    lightMaterial?: Material;

    /**
     * Material to use when in the dark dimension
     */
    @property.material()
    darkMaterial?: Material;

    /**
     * Object containing the TextComponent
     */
    @property.object({ required: true })
    textObject!: Object3D;

    /**
     * Reference to the actual TextComponent
     * @private
     */
    private _textComponent!: TextComponent;

    /**
     * Initializes the component by getting the TextComponent reference
     */
    start(): void {
        this._textComponent = this.textObject.getComponent(TextComponent)!;
    }

    /**
     * Sets the text content to be displayed
     * @param text The text string to display
     */
    setText(text: string) {
        this._textComponent.text = text;
    }

    /**
     * Registers event handlers when component activates
     */
    onActivate(): void {
        GlobalEvents.instance.switchDimension.add(this._switchDimension, this);
        GlobalEvents.instance.levelReset.add(this._levelReset, this);
    }

    /**
     * Removes event handlers when component deactivates
     */
    onDeactivate(): void {
        GlobalEvents.instance.switchDimension.remove(this._switchDimension);
        GlobalEvents.instance.levelReset.remove(this._levelReset);
    }

    /**
     * Switches the text material based on current dimension
     * @param isLight Whether the current dimension is light (true) or dark (false)
     * @private
     */
    private _switchDimension(isLight: boolean): void {
        if (this._textComponent && !this._textComponent.isDestroyed) {
            this._textComponent.material = isLight
                ? this.lightMaterial
                : this.darkMaterial;
        }
    }

    /**
     * Resets text material to light dimension material
     * @private
     */
    private _levelReset(): void {
        this._switchDimension(true);
    }
}
