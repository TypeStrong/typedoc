import {Converter} from '../converter';
import {EventDispatcher} from '../../utils/events';

export type PluginConstructor = new (converter: Converter) => Plugin;

export abstract class Plugin extends EventDispatcher {
    protected converter: Converter;

    constructor(converter: Converter) {
        super();
        this.converter = converter;

        this.initialize();
    }

    abstract initialize(): void;
}
