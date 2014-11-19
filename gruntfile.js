module.exports = function(grunt)
{
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            themes: {
                options: {
                    sourceMap: false,
                    module: 'commonjs',
                    basePath: 'themes',
                    declaration: false
                },
                src: ['themes/**/theme.ts'],
                outDir: 'bin/themes'
            },
            themeDefault: {
                options: {
                    sourceMap: false,
                    module: 'commonjs',
                    basePath: 'themes',
                    declaration: false
                },
                src: ['themes/default/assets/js/src/**/*.ts'],
                out: 'themes/default/assets/js/main.js'
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
                    cwd: './',
                    src: 'themes/**/*.sass',
                    dest: 'bin',
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
                src: 'bin/themes/**/*.css',
                dest: './'
            }
        },
        uglify: {
            themeDefault: {
                options: {
                    mangle: false
                },
                files: {
                    'bin/themes/default/assets/js/main.js': [
                        'themes/default/assets/js/lib/jquery-2.1.1.min.js',
                        'themes/default/assets/js/lib/underscore-1.6.0.min.js',
                        'themes/default/assets/js/lib/backbone-1.1.2.min.js',
                        'themes/default/assets/js/lib/lunr.min.js',
                        'themes/default/assets/js/main.js'
                    ]
                }
            }
        },
        'string-replace': {
            themeMinimal: {
                files: {
                    'bin/themes/minimal/layouts/default.hbs': ['themes/minimal/layouts/default.hbs']
                },
                options: {
                    replacements: [{
                        pattern: /{{ CSS }}/g,
                        replacement: function() {
                            var css = grunt.file.read('bin/themes/default/assets/css/main.css');
                            return css.replace(/url\(([^\)]*)\)/g, function(match, file) {
                                if (match.indexOf(':') != -1) return match;
                                var path = require('path'), fs = require('fs');
                                var file = path.resolve('bin/themes/default/assets/css', file);
                                var data = fs.readFileSync(file, 'base64');
                                return 'url(data:image/png;base64,' + data + ')';
                            });
                        }
                    }, {
                        pattern: /{{ JS }}/g,
                        replacement: function() {
                            return grunt.file.read('bin/themes/default/assets/js/main.js').replace('{{', '{/**/{');
                        }
                    }]
                }
            }
        },
        copy: {
            themeDefault: {
                files: {
                    'examples/self/doc/assets/css/main.css': 'bin/themes/default/assets/css/main.css',
                    'examples/self/doc/assets/js/main.js': 'bin/themes/default/assets/js/main.js'
                }
            }
        },
        watch: {
            themes: {
                files: ['themes/**/theme.ts'],
                tasks: ['ts:themes']
            },
            themeDefaultTypescript: {
                files: ['themes/default/assets/js/src/**/*.ts'],
                tasks: ['ts:themeDefault', 'uglify:themeDefault', 'copy:themeDefault', 'string-replace:themeMinimal']
            },
            themeDefaultSass: {
                files: ['themes/default/**/*.sass'],
                tasks: ['sass:themeDefault', 'autoprefixer', 'copy:themeDefault', 'string-replace:themeMinimal']
            },
            themeMinimalLayout: {
                files: ['themes/minimal/layouts/default.hbs'],
                tasks: ['string-replace:themeMinimal']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', ['ts:typedoc', 'string-replace:version']);
    grunt.registerTask('compiler', ['ts:compiler']);
    grunt.registerTask('theme', ['ts:themes', 'ts:themeDefault', 'uglify:themeDefault','sass:themeDefault','autoprefixer','string-replace:themeMinimal']);
};
