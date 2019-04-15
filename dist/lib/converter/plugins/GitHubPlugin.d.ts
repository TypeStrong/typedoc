import { ConverterComponent } from '../components';
export declare class Repository {
    path: string;
    branch: string;
    files: string[];
    gitHubUser?: string;
    gitHubProject?: string;
    gitHubHostname: string;
    constructor(path: string, gitRevision: string, repoLinks: string[]);
    contains(fileName: string): boolean;
    getGitHubURL(fileName: string): string | undefined;
    static tryCreateRepository(path: string, gitRevision: string): Repository | undefined;
}
export declare class GitHubPlugin extends ConverterComponent {
    private repositories;
    private ignoredPaths;
    gitRevision: string;
    initialize(): void;
    private getRepository;
    private onEndResolve;
}
