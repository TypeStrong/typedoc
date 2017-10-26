import { Application, ProjectReflection } from '..';
import * as FS from 'fs-extra';
import * as Path from 'path';
import Assert = require('assert');

function getFileIndex(base, dir: string = '', results: string[] = []) {
    const files = FS.readdirSync(Path.join(base, dir));
    files.forEach(function(file) {
        file = Path.join(dir, file);
        if (FS.statSync(Path.join(base, file)).isDirectory()) {
            getFileIndex(base, file, results);
        } else {
            results.push(file);
        }
    });

    return results.sort();
}

function compareDirectories(a, b) {
    const aFiles = getFileIndex(a);
    const bFiles = getFileIndex(b);
    Assert.deepEqual(aFiles, bFiles, `Generated files differ. between "${ a }" and "${ b }"`);

    const gitHubRegExp = /https:\/\/github.com\/[A-Za-z0-9\-]+\/typedoc\/blob\/[^\/]*\/examples/g;
    aFiles.forEach(function (file) {
        const aSrc = FS.readFileSync(Path.join(a, file), {encoding: 'utf-8'})
            .replace('\r', '')
            .replace(gitHubRegExp, '%GITHUB%');
        const bSrc = FS.readFileSync(Path.join(b, file), {encoding: 'utf-8'})
            .replace('\r', '')
            .replace(gitHubRegExp, '%GITHUB%');

        if (aSrc !== bSrc) {
            const err: any = new Error(`File contents of "${file}" differ.`);
            err.expected = aSrc;
            err.actual = bSrc;
            err.showDiff = true;
            throw err;
        }
    });
}

describe('Renderer', function() {
    const src = Path.join(__dirname, '..', '..', 'examples', 'basic', 'src');
    const out = Path.join(__dirname, '..', 'tmp', 'test');
    let app: Application, project: ProjectReflection;

    before(function() {
        FS.removeSync(out);
    });

    after(function() {
        FS.removeSync(out);
    });

    it('constructs', function() {
        app = new Application({
            mode:   'Modules',
            logger: 'console',
            target: 'ES5',
            module: 'CommonJS',
            gaSite: 'foo.com' // verify theme option without modifying output
        });
    });

    it('converts basic example', function() {
        this.timeout(0);
        const input = app.expandInputFiles([src]);
        project = app.convert(input);

        Assert(app.logger.errorCount === 0, 'Application.convert returned errors');
        Assert(project instanceof ProjectReflection, 'Application.convert did not return a reflection');
    });

    it('renders basic example', function() {
        this.timeout(0);
        const result = app.generateDocs(project, out);
        Assert(result === true, 'Application.generateDocs returned errors');

        FS.removeSync(Path.join(out, 'assets'));
        compareDirectories(Path.join(__dirname, 'renderer', 'specs'), out);
    });
});
