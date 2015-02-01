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
        watch: {
            source: {
                files: ['src/**/*.ts'],
                tasks: ['ts:typedoc', 'string-replace:version']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', ['ts:typedoc', 'string-replace:version']);

    grunt.registerTask('build-test-specs', function() {
        console.log(__dirname);
        var FS = require('fs');
        var Path = require('path');
        var TD = require(Path.join(__dirname, 'bin', 'typedoc.js'));

        var converter = new TD.Converter();
        var settings = new TD.Settings();
        var base = Path.join(__dirname, 'test', 'converter');

        FS.readdirSync(Path.join(base)).forEach(function(directory) {
            var path = Path.join(base, directory);
            if (!FS.lstatSync(path).isDirectory()) return;

            settings.inputFiles = [path];
            settings.expandInputFiles();
            settings.compilerOptions.noLib = true;
            TD.resetReflectionID();

            var result = converter.convert(settings.inputFiles, settings);
            var data = JSON.stringify(result.project.toObject(), null, '  ');
            data = data.split(TD.normalizePath(base)).join('%BASE%');

            FS.writeFileSync(Path.join(base, directory, 'specs.json'), data);
        });
    });
};