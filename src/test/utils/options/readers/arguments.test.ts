import { deepStrictEqual as equal } from 'assert';

import { Options, Logger } from '../../../../lib/utils';
import { ArgumentsReader } from '../../../../lib/utils/options/readers';
import { ParameterType } from '../../../../lib/utils/options';

describe('ArgumentsReader', () => {
    const options = new Options(new Logger());
    options.addDefaultDeclarations();
    options.addDeclaration({
        name: 'numOption',
        short: 'no',
        help: '',
        type: ParameterType.Number
    });
    options.addDeclaration({
        name: 'bool',
        help: '',
        type: ParameterType.Boolean
    });
    options.addDeclaration({
        name: 'map',
        help: '',
        type: ParameterType.Map,
        map: {
            item: { a: true },
            other: 'blah'
        },
        defaultValue: 'blah'
    });
    options.addDeclaration({
        name: 'mixed',
        help: '',
        type: ParameterType.Mixed
    });

    function test(name: string, args: string[], cb: () => void) {
        it(name, () => {
            const reader = new ArgumentsReader(1, args);
            options.reset();
            options.addReader(reader);
            options.read(new Logger());
            cb();
            options.removeReaderByName(reader.name);
        });
    }

    test('Puts arguments with no flag into inputFiles', ['foo', 'bar'], () => {
        equal(options.getValue('inputFiles'), ['foo', 'bar']);
    });

    test('Works with string options', ['--out', 'outDir'], () => {
        equal(options.getValue('out'), 'outDir');
    });

    test('Works with number options', ['-no', '123'], () => {
        equal(options.getValue('numOption'), 123);
    });

    test('Works with boolean options', ['--bool'], () => {
        equal(options.getValue('bool'), true);
    });

    test('Allows setting boolean options with a value', ['--bool', 'TrUE'], () => {
        equal(options.getValue('bool'), true);
        equal(options.getValue('inputFiles'), []);
    });

    test('Allows setting boolean options to false with a value', ['--bool', 'FALse'], () => {
        equal(options.getValue('bool'), false);
        equal(options.getValue('inputFiles'), []);
    });

    test('Bool options do not improperly consume arguments', ['--bool', 'foo'], () => {
        equal(options.getValue('bool'), true);
        equal(options.getValue('inputFiles'), ['foo']);
    });

    test('Works with map options', ['--map', 'item'], () => {
        equal(options.getValue('map'), { a: true });
    });

    test('Works with mixed options', ['--mixed', 'word'], () => {
        equal(options.getValue('mixed'), 'word');
    });

    test('Works with array options', ['--exclude', 'a'], () => {
        equal(options.getValue('exclude'), ['a']);
    });

    test('Splits array options (backward compatibility)', ['--exclude', 'a,b'], () => {
        equal(options.getValue('exclude'), ['a', 'b']);
    });

    test('Works with array options passed multiple times', ['--exclude', 'a', '--exclude', 'b'], () => {
        equal(options.getValue('exclude'), ['a', 'b']);
    });

    it('Errors if given an unknown option', () => {
        let check = false;
        class TestLogger extends Logger {
            error(msg: string) {
                equal(msg, 'Unknown option: --badOption');
                check = true;
            }
        }
        const reader = new ArgumentsReader(1, ['--badOption']);
        options.reset();
        options.addReader(reader);
        options.read(new TestLogger());
        options.removeReaderByName(reader.name);
        equal(check, true, 'Reader did not report an error.');
    });
});
