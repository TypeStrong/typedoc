module.exports = function(grunt)
{
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            typedoc: {
                options: {
                    basePath: 'src',
                    declaration: true,
                    comments: true,
                    sourceMap: false
                },
                src: ['src/**/*.ts'],
                out: 'bin/typedoc.js'
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
                    'typescript/src/compiler/binder.ts',
                    'typescript/src/compiler/checker.ts',
                    'typescript/src/compiler/emitter.ts',
                    'typescript/src/compiler/commandLineParser.ts',
                    'typescript/src/compiler/tsc.ts',
                    'typescript/src/compiler/diagnosticInformationMap.generated.ts'
                ],
                out: 'src/lib/typescript/tsc.js'
            }
        },
        'string-replace': {
            version: {
                files: {
                    'bin/typedoc.js': ['bin/typedoc.js']
                },
                options: {
                    replacements: [{
                        pattern: /{{ VERSION }}/g,
                        replacement: '<%= pkg.version %>'
                    }]
                }
            }
        },
        clean: {
            specsBefore: ['test/renderer/specs'],
            specsAfter: ['test/renderer/specs/assets']
        },
        watch: {
            source: {
                files: ['src/**/*.ts'],
                tasks: ['ts:typedoc', 'string-replace:version']
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'test',
                options: {
                    mask: '*.js'
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.registerTask('default', ['ts:typedoc', 'string-replace:version']);
    grunt.registerTask('build_and_test', ['default', 'specs', 'mocha_istanbul:coverage']);
    grunt.registerTask('specs', ['clean:specsBefore', 'build-specs', 'clean:specsAfter']);

    grunt.registerTask('build-specs', function() {
        var FS = require('fs');
        var Path = require('path');
        var TypeDoc = require(Path.join(__dirname, 'bin', 'typedoc.js'));

        var base = Path.join(__dirname, 'test', 'converter');
        var app = new TypeDoc.Application({
            mode:   'Modules',
            target: 'ES5',
            module: 'CommonJS',
            noLib:  true,
            experimentalDecorators: true
        });

        FS.readdirSync(Path.join(base)).forEach(function(directory) {
            var path = Path.join(base, directory);
            if (!FS.lstatSync(path).isDirectory()) return;
            TypeDoc.models.resetReflectionID();

            var src = app.expandInputFiles([path]);
            var out = Path.join(base, directory, 'specs.json');
            var result = app.convert(src);
            var data = JSON.stringify(result.toObject(), null, '  ');
            data = data.split(TypeDoc.normalizePath(base)).join('%BASE%');
            FS.writeFileSync(out, data);
        });

        var src = Path.join(__dirname, 'examples', 'basic', 'src');
        var out = Path.join(__dirname, 'test', 'renderer', 'specs');

        TypeDoc.FS.removeSync(out);
        app.generateDocs(app.expandInputFiles([src]), out);
        TypeDoc.FS.removeSync(Path.join(out, 'assets'));
    });
};