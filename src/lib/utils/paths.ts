import * as Path from 'path';
import { isArray } from 'util';
import { Minimatch, IMinimatch } from 'minimatch';

function createMinimatch(pattern: string): IMinimatch {
  if (pattern[0] === '.' || /^\w+(?!:)($|[/\\])/.test(pattern)) {
    pattern = Path.resolve(pattern);
  }

  return new Minimatch(pattern, { dot: true });
}

export function pathToMinimatch(pattern: string | string[]): IMinimatch | IMinimatch[] {
  return isArray(pattern)
    ? pattern.map(createMinimatch)
    : createMinimatch(pattern);
}
