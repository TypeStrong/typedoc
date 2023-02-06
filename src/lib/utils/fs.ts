import * as fs from "fs";
import { promises as fsp } from "fs";
import { Minimatch } from "minimatch";
import { dirname, join, relative } from "path";

/**
 * Get the longest directory path common to all files.
 */
export function getCommonDirectory(files: readonly string[]): string {
    if (!files.length) {
        return "";
    }

    const roots = files.map((f) => f.split(/\\|\//));
    if (roots.length === 1) {
        return roots[0].slice(0, -1).join("/");
    }

    let i = 0;

    while (new Set(roots.map((part) => part[i])).size === 1) {
        i++;
    }

    return roots[0].slice(0, i).join("/");
}

/**
 * Normalize the given path.
 *
 * @param path  The path that should be normalized.
 * @returns The normalized path.
 */
export function normalizePath(path: string) {
    return path.replace(/\\/g, "/");
}

/**
 * Load the given file and return its contents.
 *
 * @param file  The path of the file to read.
 * @returns The files contents.
 */
export function readFile(file: string): string {
    const buffer = fs.readFileSync(file);
    switch (buffer[0]) {
        case 0xfe:
            if (buffer[1] === 0xff) {
                let i = 0;
                while (i + 1 < buffer.length) {
                    const temp = buffer[i];
                    buffer[i] = buffer[i + 1];
                    buffer[i + 1] = temp;
                    i += 2;
                }
                return buffer.toString("ucs2", 2);
            }
            break;
        case 0xff:
            if (buffer[1] === 0xfe) {
                return buffer.toString("ucs2", 2);
            }
            break;
        case 0xef:
            if (buffer[1] === 0xbb) {
                return buffer.toString("utf8", 3);
            }
    }

    return buffer.toString("utf8", 0);
}

/**
 * Write a file to disc.
 *
 * If the containing directory does not exist it will be created.
 *
 * @param fileName  The name of the file that should be written.
 * @param data  The contents of the file.
 */
export function writeFileSync(fileName: string, data: string) {
    fs.mkdirSync(dirname(normalizePath(fileName)), { recursive: true });
    fs.writeFileSync(normalizePath(fileName), data);
}

/**
 * Write a file to disc.
 *
 * If the containing directory does not exist it will be created.
 *
 * @param fileName  The name of the file that should be written.
 * @param data  The contents of the file.
 */
export async function writeFile(fileName: string, data: string) {
    await fsp.mkdir(dirname(normalizePath(fileName)), {
        recursive: true,
    });
    await fsp.writeFile(normalizePath(fileName), data);
}

/**
 * Copy a file or directory recursively.
 */
export async function copy(src: string, dest: string): Promise<void> {
    const stat = await fsp.stat(src);

    if (stat.isDirectory()) {
        const contained = await fsp.readdir(src);
        await Promise.all(
            contained.map((file) => copy(join(src, file), join(dest, file)))
        );
    } else if (stat.isFile()) {
        await fsp.mkdir(dirname(dest), { recursive: true });
        await fsp.copyFile(src, dest);
    } else {
        // Do nothing for FIFO, special devices.
    }
}

export function copySync(src: string, dest: string): void {
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
        const contained = fs.readdirSync(src);
        contained.forEach((file) =>
            copySync(join(src, file), join(dest, file))
        );
    } else if (stat.isFile()) {
        fs.mkdirSync(dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    } else {
        // Do nothing for FIFO, special devices.
    }
}

/**
 * Simpler version of `glob.sync` that only covers our use cases, always ignoring node_modules.
 */
export function glob(
    pattern: string,
    root: string,
    options: { includeDirectories?: boolean; followSymlinks?: boolean } = {}
): string[] {
    const result: string[] = [];
    const mini = new Minimatch(normalizePath(pattern));
    const dirs: string[][] = [normalizePath(root).split("/")];
    // cache of real paths to avoid infinite recursion
    const symlinkTargetsSeen: Set<string> = new Set();
    // cache of fs.realpathSync results to avoid extra I/O
    const realpathCache: Map<string, string> = new Map();
    const { includeDirectories = false, followSymlinks = false } = options;

    let dir = dirs.shift();

    const handleFile = (path: string) => {
        const childPath = [...dir!, path].join("/");
        if (mini.match(childPath)) {
            result.push(childPath);
        }
    };

    const handleDirectory = (path: string) => {
        const childPath = [...dir!, path];
        if (
            mini.set.some((row) =>
                mini.matchOne(childPath, row, /* partial */ true)
            )
        ) {
            dirs.push(childPath);
        }
    };

    const handleSymlink = (path: string) => {
        const childPath = [...dir!, path].join("/");
        let realpath: string;
        try {
            realpath =
                realpathCache.get(childPath) ?? fs.realpathSync(childPath);
            realpathCache.set(childPath, realpath);
        } catch {
            return;
        }

        if (symlinkTargetsSeen.has(realpath)) {
            return;
        }
        symlinkTargetsSeen.add(realpath);

        try {
            const stats = fs.statSync(realpath);
            if (stats.isDirectory()) {
                handleDirectory(path);
            } else if (stats.isFile()) {
                handleFile(path);
            } else if (stats.isSymbolicLink()) {
                const dirpath = dir!.join("/");
                if (dirpath === realpath) {
                    // special case: real path of symlink is the directory we're currently traversing
                    return;
                }
                const targetPath = relative(dirpath, realpath);
                handleSymlink(targetPath);
            } // everything else should be ignored
        } catch (e) {
            // invalid symbolic link; ignore
        }
    };

    while (dir) {
        if (includeDirectories && mini.match(dir.join("/"))) {
            result.push(dir.join("/"));
        }

        for (const child of fs.readdirSync(dir.join("/"), {
            withFileTypes: true,
        })) {
            if (child.isFile()) {
                handleFile(child.name);
            } else if (child.isDirectory() && child.name !== "node_modules") {
                handleDirectory(child.name);
            } else if (followSymlinks && child.isSymbolicLink()) {
                handleSymlink(child.name);
            }
        }

        dir = dirs.shift();
    }

    return result;
}
