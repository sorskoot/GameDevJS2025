import { NotifyPropertyChanged } from '@sorskoot/wonderland-components';
import { GlobalEvents } from './GlobalEvents.js';

export class LevelState extends NotifyPropertyChanged {
    private _isLight: boolean;

    constructor() {
        super();
        this._isLight = true;
    }

    switchDimension() {
        this._isLight = !this._isLight;
        this.notifyPropertyChanged('isLight');
        GlobalEvents.instance.SwitchDimension.dispatch(this._isLight);
    }
}
