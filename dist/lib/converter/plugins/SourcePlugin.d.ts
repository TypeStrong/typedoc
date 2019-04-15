import { ConverterComponent } from '../components';
export declare class SourcePlugin extends ConverterComponent {
    private basePath;
    private fileMappings;
    initialize(): void;
    private getSourceFile;
    private onBegin;
    private onBeginDocument;
    private onDeclaration;
    private onBeginResolve;
    private onResolve;
    private onEndResolve;
}
