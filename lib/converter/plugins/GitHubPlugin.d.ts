import { ConverterComponent } from "../components";
export declare class GitHubPlugin extends ConverterComponent {
    private repositories;
    private ignoredPaths;
    initialize(): void;
    private getRepository(fileName);
    private onEndResolve(context);
}
