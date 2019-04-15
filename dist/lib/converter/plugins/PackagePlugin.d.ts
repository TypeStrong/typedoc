import { ConverterComponent } from '../components';
export declare class PackagePlugin extends ConverterComponent {
    readme: string;
    private readmeFile?;
    private packageFile?;
    private visited;
    private noReadmeFile?;
    initialize(): void;
    private onBegin;
    private onBeginDocument;
    private onBeginResolve;
}
