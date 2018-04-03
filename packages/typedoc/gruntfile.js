module.exports = function(grunt)
{
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            typedoc: {
                tsconfig: { passThrough: true }
            },
            typescript: {
                options: {
                    sourceMap: false,
                    declaration: true
                },
                src: [
                    'typescript/src/compiler/core.ts',
                    'typescript/src/compiler/sys.ts',
                    'typescript/src/compiler/types.ts',
                    'typescript/src/compiler/scanner.ts',
                    'typescript/src/compiler/parser.ts',
                    'typescript/src/compiler/utilities.ts',
                    'typescript/src/compiler/binder.ts',
                    'typescript/src/compiler/checker.ts',
                    'typescript/src/compiler/declarationEmitter.ts',
                    'typescript/src/compiler/emitter.ts',
                    'typescript/src/compiler/program.ts',
                    'typescript/src/compiler/commandLineParser.ts',
                    'typescript/src/compiler/diagnosticInformationMap.generated.ts'
                ],
                out: 'src/typings/typescript/typescript.js'
            }
        },
        tslint: {
            options: {
                configuration: 'tslint.json'
            },
            files: {
                src: [ 'src/**/*.ts', '!src/test/converter/**/*.ts' ]
            }
        },
        'string-replace': {
            version: {
                files: {
                    'dist/lib/application.js': ['dist/lib/application.js']
                },
                options: {
                    replacements: [{
                        pattern: /{{ VERSION }}/g,
                        replacement: '<%= pkg.version %>'
                    }]
                }
            },
            typescript: {
                files: {
                    'src/typings/typescript/typescript.d.ts': ['src/typings/typescript/typescript.d.ts']
                },
                options: {
                    replacements: [{
                        pattern: /\}[\s\n\r]*declare namespace ts \{/g,
                        replacement: ''
                    }, {
                        pattern: /declare namespace ts/g,
                        replacement: 'declare module "typescript"'
                    }]
                }
            }
        },
        copy:  {
            staticTestFiles: {
                expand: true,
                cwd: 'src',
                src: [
                    'test/converter/**/*',
                    'test/renderer/**/*'
                ],
                dest: 'dist/'
            }
        },
        clean: {
            specsBefore: ['src/test/renderer/specs'],
            specsAfter: ['src/test/renderer/specs/assets']
        },
        watch: {
            source: {
                files: ['src/**/*.ts'],
                tasks: ['ts:typedoc', 'string-replace:version']
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'dist/test',
                options: {
                    mask: '*.js',
                    timeout: 10000
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.registerTask('default', ['tslint', 'ts:typedoc', 'string-replace:version']);
    grunt.registerTask('build_and_test', ['default', 'specs', 'copy', 'mocha_istanbul:coverage']);
    grunt.registerTask('specs', ['clean:specsBefore', 'build-specs', 'clean:specsAfter']);

    grunt.registerTask('build-specs', function() {
        var FS = require('fs-extra');
        var Path = require('path');
        var TypeDoc = require('./');

        var base = Path.join(__dirname, 'src', 'test', 'converter');
        var app = new TypeDoc.Application({
            mode:   'Modules',
            target: 'ES5',
            module: 'CommonJS',
            experimentalDecorators: true,
            jsx: 'react',
            lib: [
                "lib.dom.d.ts",
                "lib.es5.d.ts",
                "lib.es2015.iterable.d.ts",
                "lib.es2015.collection.d.ts"
            ],
        });

        FS.readdirSync(Path.join(base)).forEach(function(directory) {
            console.log(directory);

            var path = Path.join(base, directory);
            if (!FS.lstatSync(path).isDirectory()) return;
            TypeDoc.resetReflectionID();

            var src = app.expandInputFiles([path]);
            var out = Path.join(base, directory, 'specs.json');
            var result = app.convert(src);
            var data = JSON.stringify(result.toObject(), null, '  ');
            data = data.split(TypeDoc.normalizePath(base)).join('%BASE%');
            FS.writeFileSync(out, data);
        });

        var src = Path.join(__dirname, 'examples', 'basic', 'src');
        var out = Path.join(__dirname, 'src', 'test', 'renderer', 'specs');

        FS.removeSync(out);
        app.generateDocs(app.expandInputFiles([src]), out);


        function getFileIndex(base, dir, results) {
            results = results || [];
            dir = dir || '';
            var files = FS.readdirSync(Path.join(base, dir));
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

        FS.removeSync(Path.join(out, 'assets'));
        var gitHubRegExp = /https:\/\/github.com\/[A-Za-z0-9\-]+\/typedoc\/blob\/[^\/]*\/examples/g;
        getFileIndex(out).forEach(function (file) {
            file = Path.join(out, file);
            FS.writeFileSync(file, FS.readFileSync(file, {encoding:'utf-8'}).replace(gitHubRegExp, 'https://github.com/sebastian-lenz/typedoc/blob/master/examples'));
        });
    });
};
