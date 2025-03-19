import type ts from "typescript";
import { EventDispatcher } from "#utils";

export class WatchHost extends EventDispatcher<{
    fileChanged: [path: string, shouldRestart: boolean];
}> {
    private watchers = new Map<string, ts.FileWatcher>();
    private criticalFiles = new Set<string>();

    private listener = (path: string) => {
        this.trigger("fileChanged", path, this.criticalFiles.has(path));
    };

    constructor(readonly host: ts.WatchCompilerHost<ts.BuilderProgram>) {
        super();
    }

    watchFile(path: string, shouldRestart: boolean) {
        if (!this.watchers.has(path)) {
            this.watchers.set(path, this.host.watchFile(path, this.listener));
        }
        if (shouldRestart) {
            this.criticalFiles.add(path);
        }
    }

    clearWatchers() {
        this.watchers.forEach((w) => w.close());
        this.watchers.clear();
    }

    [Symbol.dispose]() {
        this.clearWatchers();
    }
}
