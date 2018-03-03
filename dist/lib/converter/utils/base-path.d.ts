export declare class BasePath {
    private basePaths;
    add(fileName: string): void;
    trim(fileName: string): string;
    reset(): void;
    static normalize(path: string): string;
}
