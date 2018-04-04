module.exports = function(grunt)
{
    grunt.initConfig({
        typedocPkg: grunt.file.readJSON('packages/typedoc/package.json'),
        ts: {
            typedoc: {
                tsconfig: {
                    passThrough: true,
                    tsconfig: 'packages/typedoc/tsconfig.json',
                }
            },
            themeDefault: {
                options: {
                    sourceMap: false,
                    module: 'amd',
                    basePath: 'themes',
                    declaration: false
                },
                src: [
                    'packages/typedoc-default-themes/src/default/assets/js/src/lib/**/*.ts',
                    'packages/typedoc-default-themes/src/default/assets/js/src/typedoc/Application.ts',
                    'packages/typedoc-default-themes/src/default/assets/js/src/typedoc/components/**/*.ts',
                    'packages/typedoc-default-themes/src/default/assets/js/src/typedoc/services/**/*.ts',
                    'packages/typedoc-default-themes/src/default/assets/js/src/typedoc/utils/**/*.ts',
                    'packages/typedoc-default-themes/src/default/assets/js/src/~bootstrap.ts'
                ],
                out: 'packages/typedoc-default-themes/src/default/assets/js/main.js'
            }
        },
        uglify: {
            themeDefault: {
                options: {
                    mangle: false
                },
                files: {
                    'packages/typedoc-default-themes/bin/default/assets/js/main.js': [
                        'packages/typedoc-default-themes/src/default/assets/js/lib/jquery-2.1.1.min.js',
                        'packages/typedoc-default-themes/src/default/assets/js/lib/underscore-1.6.0.min.js',
                        'packages/typedoc-default-themes/src/default/assets/js/lib/backbone-1.1.2.min.js',
                        'packages/typedoc-default-themes/src/default/assets/js/lib/lunr.min.js',
                        'packages/typedoc-default-themes/src/default/assets/js/main.js'
                    ]
                }
            }
        },
        tslint: {
            options: {
                configuration: 'tslint.json'
            },
            files: {
                src: [ 'packages/typedoc/src/**/*.ts', '!packages/typedoc/src/test/converter/**/*.ts' ]
            }
        },
        'string-replace': {
            version: {
                files: {
                    'packages/typedoc/dist/lib/application.js': ['packages/typedoc/dist/lib/application.js']
                },
                options: {
                    replacements: [{
                        pattern: /{{ VERSION }}/g,
                        replacement: '<%= typedocPkg.version %>'
                    }]
                }
            },
            themeMinimal: {
                files: {
                    'packages/typedoc-default-themes/bin/minimal/layouts/default.hbs': ['packages/typedoc-default-themes/src/minimal/layouts/default.hbs']
                },
                options: {
                    replacements: [{
                        pattern: /{{ CSS }}/g,
                        replacement: function() {
                            var css = grunt.file.read('packages/typedoc-default-themes/bin/default/assets/css/main.css');
                            return css.replace(/url\(([^\)]*)\)/g, function(match, file) {
                                if (match.indexOf(':') != -1) return match;
                                var path = require('path'), fs = require('fs');
                                var file = path.resolve('packages/typedoc-default-themes/bin/default/assets/css', file);
                                var data = fs.readFileSync(file, 'base64');
                                return 'url(data:image/png;base64,' + data + ')';
                            });
                        }
                    }, {
                        pattern: /{{ JS }}/g,
                        replacement: function() {
                            return grunt.file.read('packages/typedoc-default-themes/bin/default/assets/js/main.js').replace('{{', '{/**/{');
                        }
                    }]
                }
            }
        },
        sass: {
            options: {
                style: 'compact',
                unixNewlines: true
            },
            themeDefault: {
                files: [{
                    expand: true,
                    cwd: 'packages/typedoc-default-themes/src/default/assets/css',
                    src: '**/*.sass',
                    dest: 'packages/typedoc-default-themes/bin/default/assets/css',
                    ext: '.css'
                }]
            }
        },
        autoprefixer: {
            options: {
                cascade: false
            },
            themeDefault: {
                expand: true,
                src: 'packages/typedoc-default-themes/bin/**/*.css',
                dest: 'packages/typedoc-default-themes/'
            }
        },
        copy:  {
            staticTestFiles: {
                expand: true,
                cwd: 'packages/typedoc/src',
                src: [
                    'test/converter/**/*',
                    'test/renderer/**/*'
                ],
                dest: 'packages/typedoc/dist/'
            },
            plugin: {
              files: [{
                expand: true,
                cwd: 'packages/typedoc-default-themes/src',
                src: ['*.js'],
                dest: 'packages/typedoc-default-themes/bin'
              }]
            },
            themeDefault: {
                files: [{
                    expand: true,
                    cwd: 'packages/typedoc-default-themes/src/default',
                    src: ['**/*.hbs', '**/*.png'],
                    dest: 'packages/typedoc-default-themes/bin/default'
                }]
            },
            themeDefault2Minimal: {
                files: [{
                    expand: true,
                    cwd: 'packages/typedoc-default-themes/src/default/partials',
                    src: ['**/*.hbs'],
                    dest: 'packages/typedoc-default-themes/bin/minimal/partials'
                }]
            },
            themeMinimal: {
                files: [{
                    expand: true,
                    cwd: 'packages/typedoc-default-themes/src/minimal',
                    src: ['**/*.hbs'],
                    dest: 'packages/typedoc-default-themes/bin/minimal'
                }]
            }
        },
        clean: {
            specsBefore: ['packages/typedoc/src/test/renderer/specs'],
            specsAfter: ['packages/typedoc/src/test/renderer/specs/assets'],
            theme: ['package/typedoc-default-themes/bin'],
        },
        watch: {
            source: {
                files: ['packages/typedoc/src/**/*.ts'],
                tasks: ['ts:typedoc', 'string-replace:version']
            },
            themeSource: {
                files: ['packages/typedoc-default-themes/src/default/assets/js/src/**/*.ts'],
                tasks: ['theme_js']
            },
            css: {
                files: ['packages/typedoc-default-themes/src/default/assets/css/**/*'],
                tasks: ['css']
            },
            default: {
                files: ['packages/typedoc-default-themes/src/default/**/*.hbs'],
                tasks: ['copy_theme', 'string-replace:themeMinimal']
            },
            minimal: {
                files: ['packages/typedoc-default-themes/src/minimal/partials/**/*.hbs', 'src/minimal/templates/**/*.hbs'],
                tasks: ['copy:themeMinimal']
            },
            minimalLayout: {
                files: ['packages/typedoc-default-themes/src/minimal/layouts/default.hbs'],
                tasks: ['string-replace:themeMinimal']
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'packages/typedoc/dist/test',
                options: {
                    mask: '*.js',
                    timeout: 10000
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.registerTask('css', ['sass', 'autoprefixer']);
    grunt.registerTask('theme_js', ['ts:themeDefault', 'uglify']);
    grunt.registerTask('copy_theme', ['copy:plugin', 'copy:themeDefault', 'copy:themeDefault2Minimal', 'copy:themeMinimal']);
    grunt.registerTask('build_theme', ['clean:theme', 'copy_theme', 'css', 'theme_js', 'string-replace:themeMinimal']);

    grunt.registerTask('build_typedoc', ['tslint', 'ts:typedoc', 'string-replace:version']);
    grunt.registerTask('default', ['build_typedoc', 'build_theme']);

    grunt.registerTask('specs', ['clean:specsBefore', 'build-specs', 'clean:specsAfter']);
    grunt.registerTask('build_and_test', ['default', 'specs', 'copy:staticTestFiles', 'mocha_istanbul:coverage']);

    grunt.registerTask('build-specs', function() {
        var FS = require('fs-extra');
        var Path = require('path');
        var TypeDoc = require('./packages/typedoc');

        var typedocPath = Path.join(__dirname, 'packages', 'typedoc');
        var base =  Path.join(typedocPath, 'src', 'test', 'converter');
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

        var src = Path.join(typedocPath, 'examples', 'basic', 'src');
        var out = Path.join(typedocPath, 'src', 'test', 'renderer', 'specs');

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
        var gitHubRegExp = /https:\/\/github.com\/[A-Za-z0-9\-]+\/typedoc\/blob\/[^\/]*\/packages\/typedoc\/examples/g;
        getFileIndex(out).forEach(function (file) {
            file = Path.join(out, file);
            FS.writeFileSync(file, FS.readFileSync(file, {encoding:'utf-8'}).replace(gitHubRegExp, 'https://github.com/sebastian-lenz/typedoc/blob/master/examples'));
        });
    });
};
