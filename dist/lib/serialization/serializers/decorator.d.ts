import { SerializerComponent } from '../components';
import { DecoratorWrapper } from './models/decorator-wrapper';
export declare class DecoratorContainerSerializer extends SerializerComponent<DecoratorWrapper> {
    static PRIORITY: number;
    protected static serializeGroup(instance: any): boolean;
    serializeGroup: typeof DecoratorContainerSerializer.serializeGroup;
    serializeGroupSymbol: typeof DecoratorWrapper;
    initialize(): void;
    toObject(decoratorWrapper: DecoratorWrapper, obj?: any): any;
}
