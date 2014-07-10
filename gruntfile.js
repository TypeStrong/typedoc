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
            compiler: {
                options: {
                    sourceMap: false,
                    declaration: true
                },
                src: ['typescript/src/compiler/typescript.ts'],
                out: 'src/lib/typescript/typescript.js'
            },
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
        uglify: {
            themeDefault: {
                options: {
                    mangle: false
                },
                files: {
                    'bin/themes/default/assets/js/main.js': [
                        'themes/default/assets/js/lib/jquery-2.1.1.min.js',
                        'themes/default/assets/js/lib/lunr.min.js',
                        'themes/default/assets/js/main.js'
                    ]
                }
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
        copy: {
            themeDefault: {
                files: {
                    'examples/self/doc/assets/css/main.css': 'bin/themes/default/assets/css/main.css',
                    'examples/self/doc/assets/js/main.js': 'bin/themes/default/assets/js/main.js'
                }
            }
        },
        watch: {
            typescript: {
                files: ['src/**/*.ts'],
                tasks: ['ts:typedoc', 'string-replace']
            },
            themes: {
                files: ['themes/**/theme.ts'],
                tasks: ['ts:themes']
            },
            themeDefaultTypescript: {
                files: ['themes/default/assets/js/src/**/*.ts'],
                tasks: ['ts:themeDefault', 'uglify:themeDefault', 'copy:themeDefault']
            },
            themeDefaultSass: {
                files: ['themes/**/*.sass'],
                tasks: ['sass:themeDefault', 'copy:themeDefault']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', ['ts:typedoc', 'string-replace']);
    grunt.registerTask('compiler', ['ts:compiler']);
    grunt.registerTask('theme', ['ts:themes', 'ts:themeDefault', 'uglify:themeDefault','sass:themeDefault']);
};
