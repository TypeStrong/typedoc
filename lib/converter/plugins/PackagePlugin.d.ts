import { ConverterComponent } from "../components";
export declare class PackagePlugin extends ConverterComponent {
    readme: string;
    private readmeFile;
    private packageFile;
    private visited;
    private noReadmeFile;
    initialize(): void;
    private onBegin(context);
    private onBeginDocument(context, reflection, node?);
    private onBeginResolve(context);
}
