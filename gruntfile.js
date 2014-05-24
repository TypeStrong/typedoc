module.exports = function(grunt)
{
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            typedoc: {
                options: {
                    basePath: 'src',
                    declaration: true,
                    comments: true
                },
                src: ['src/**/*.ts'],
                dest: 'bin/typedoc.js'
            },
            compiler: {
                options: {
                    declaration: true
                },
                src: ['typescript/src/compiler/typescript.ts'],
                dest: 'src/lib/typescript/typescript.js'
            },
            themes: {
                options: {
                    module: 'commonjs',
                    basePath: 'themes'
                },
                src: ['themes/**/theme.ts'],
                dest: 'bin/themes'
            },
            themeDefault: {
                src: ['themes/default/assets/js/src/**/*.ts'],
                dest: 'themes/default/assets/js/main.js'
            }
        },
        sass: {
            options: {
                style: 'compressed'
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
                        'themes/default/assets/js/main.js'
                    ]
                }
            }
        },
        copy: {
            themeDefault: {
                files: {
                    'etc/doc/assets/css/main.css': 'bin/themes/default/assets/css/main.css',
                    'etc/doc/assets/js/main.js': 'bin/themes/default/assets/js/main.js'
                }
            }
        },
        watch: {
            typescript: {
                files: ['src/**/*.ts'],
                tasks: ['typescript:typedoc']
            },
            themes: {
                files: ['themes/**/theme.ts'],
                tasks: ['typescript:themes']
            },
            themeDefaultTypescript: {
                files: ['themes/default/assets/js/src/**/*.ts'],
                tasks: ['typescript:themeDefault', 'uglify:themeDefault', 'copy:themeDefault']
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
    grunt.loadNpmTasks('grunt-typescript');

    grunt.registerTask('default', ['typescript:typedoc']);
    grunt.registerTask('compiler', ['typescript:compiler']);
    grunt.registerTask('theme', ['typescript:themes', 'typescript:themeDefault', 'uglify:themeDefault','sass:themeDefault']);
};