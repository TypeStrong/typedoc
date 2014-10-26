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
            typescript: {
                files: ['src/**/*.ts'],
                tasks: ['ts:typedoc', 'string-replace:version']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', ['ts:typedoc', 'string-replace:version']);
    grunt.registerTask('compiler', ['ts:compiler']);
};
