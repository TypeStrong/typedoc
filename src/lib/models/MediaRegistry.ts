export class MediaRegistry {
    private nextId = 1;

    register(_sourcePath: string, _relativePath: string) {
        return this.nextId++;
    }
}
