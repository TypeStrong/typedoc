import { ConverterComponent } from '../components';
export declare class SourcePlugin extends ConverterComponent {
    private basePath;
    private fileMappings;
    initialize(): void;
    private getSourceFile(fileName, project);
    private onBegin();
    private onBeginDocument(context, reflection, node?);
    private onDeclaration(context, reflection, node?);
    private onBeginResolve(context);
    private onResolve(context, reflection);
    private onEndResolve(context);
}
