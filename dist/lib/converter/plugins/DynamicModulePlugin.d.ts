import { ConverterComponent } from '../components';
export declare class DynamicModulePlugin extends ConverterComponent {
    private basePath;
    private reflections;
    initialize(): void;
    private onBegin;
    private onDeclaration;
    private onBeginResolve;
}
