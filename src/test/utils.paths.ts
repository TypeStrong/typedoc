import * as Path from 'path';
import { Minimatch, IMinimatch } from 'minimatch';

import isEqual = require('lodash/isEqual');
import Assert = require('assert');

import { pathToMinimatch } from '..';

describe('Paths', () => {
  describe('pathToMinimatch', () => {
    it('Converts a path to a Minimatch expression', () => {
      const mm = pathToMinimatch('/some/path/**');
      Assert(mm instanceof Minimatch, 'Path not coverted to Minimatch');
    });

    it('Converts an array of paths to an array of Minimatch expressions', () => {
      const mms = <IMinimatch[]> pathToMinimatch(['/some/path/**', '**/another/path/**', './relative/**/path']);
      Assert(Array.isArray(mms), 'Didn\'t return an array');

      const allAreMm = mms.every((mm) => mm instanceof Minimatch);
      Assert(allAreMm, 'Not all paths are coverted to Minimatch');
    });

    it('Minimatch can match absolute paths expressions', () => {
      const paths = ['/unix/absolute/**/path', 'C:/Windows/absolute/*/path', '**/arbitrary/path/**'];
      const mms: string[] = (<IMinimatch[]> pathToMinimatch(paths))
      .map(({ pattern }) => pattern);

      Assert(isEqual(mms, paths), `Patterns have been altered:\nMMS: ${mms}\nPaths: ${paths}`);
    });

    it('Minimatch can match relative to the project root', () => {
      const paths = ['./relative/**/path', '../parent/*/path', 'no/dot/relative/**/path/*', '.dot/relative/**/path/*'];
      const absPaths = paths.map((path) => Path.resolve(path).replace(/\\/g, '/'));
      const mms: string[] = (<IMinimatch[]> pathToMinimatch(paths))
      .map(({ pattern }) => pattern);

      Assert(isEqual(mms, absPaths), `Project root have not been added to paths:\nMMS: ${mms}\nPaths: ${absPaths}`);
    });

    it('Minimatch matches dot files', () => {
      const mm = <IMinimatch> pathToMinimatch('/some/path/**');
      Assert(mm.match('/some/path/.dot/dir'), 'Didn\'t match .dot path');
      Assert(mm.match('/some/path/normal/dir'), 'Didn\'t match normal path');
    });
  });
});
