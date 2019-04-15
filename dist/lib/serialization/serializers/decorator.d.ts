import { SerializerComponent } from '../components';
import { DecoratorWrapper } from './models/decorator-wrapper';
export declare class DecoratorContainerSerializer extends SerializerComponent<DecoratorWrapper> {
    static PRIORITY: number;
    serializeGroup(instance: any): boolean;
    serializeGroupSymbol: typeof DecoratorWrapper;
    initialize(): void;
    supports(s: unknown): boolean;
    toObject(decoratorWrapper: DecoratorWrapper, obj?: any): any;
}
