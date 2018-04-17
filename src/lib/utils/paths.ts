import * as Path from 'path';
import { Minimatch, IMinimatch } from 'minimatch';

export function createMinimatch(patterns: string[]): IMinimatch[] {
    return patterns.map((pattern: string): IMinimatch => {
        // Ensure uniform absolute path cross OS
        // (POSIX would resolve c:/path to /path/to/repo/c:/path without this check)
        if (Path.isAbsolute(pattern) && Path.sep === '/') {
            pattern = pattern.replace(/^\w:/, '');
        }

        // pattern paths not starting with '**' are resolved even if it is an
        // absolute path, to ensure correct format for the current OS
        if (pattern.substr(0, 2) !== '**') {
            pattern = Path.resolve(pattern);
        }

        // Unify the path slashes before creating the minimatch, for more relyable matching
        return new Minimatch(pattern.replace(/[\\]/g, '/'), { dot: true });
    });
}
