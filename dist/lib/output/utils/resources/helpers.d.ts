import { ResourceStack, Resource } from './stack';
export declare class Helper extends Resource {
    private helpers;
    getHelpers(): any;
}
export declare class HelperStack extends ResourceStack<Helper> {
    private registeredNames;
    constructor();
    activate(): boolean;
    deactivate(): boolean;
    addCoreHelpers(): void;
    removeAllOrigins(): void;
}
