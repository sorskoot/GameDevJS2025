import {
    Component,
    Material,
    Object3D,
    TextComponent,
} from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { GlobalEvents } from '../classes/GlobalEvents.js';

export class TutorialText extends Component {
    static TypeName = 'tutorial-text';

    @property.material()
    lightMaterial?: Material;

    @property.material()
    darkMaterial?: Material;

    @property.object({ required: true })
    textObject!: Object3D;

    private _textComponent: TextComponent;

    start(): void {
        this._textComponent = this.textObject.getComponent(TextComponent);
    }

    setText(text: string) {
        this._textComponent.text = text;
    }

    onActivate(): void {
        GlobalEvents.instance.switchDimension.add(this._switchDimension, this);
        GlobalEvents.instance.levelReset.add(this._levelReset, this);
    }
    onDeactivate(): void {
        GlobalEvents.instance.switchDimension.remove(this._switchDimension);
        GlobalEvents.instance.levelReset.remove(this._levelReset);
    }

    private _switchDimension(isLight: boolean): void {
        if (this._textComponent && !this._textComponent.isDestroyed) {
            this._textComponent.material = isLight
                ? this.lightMaterial
                : this.darkMaterial;
        }
    }

    private _levelReset(): void {
        this._switchDimension(true);
    }
}
