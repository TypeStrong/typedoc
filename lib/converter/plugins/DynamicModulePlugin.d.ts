import { ConverterComponent } from "../components";
export declare class DynamicModulePlugin extends ConverterComponent {
    private basePath;
    private reflections;
    initialize(): void;
    private onBegin(context);
    private onDeclaration(context, reflection, node?);
    private onBeginResolve(context);
}
