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
                src: [
                    'src/@init.ts',
                    'src/td/Application.ts',
                    'src/td/converter/Converter.ts',
                    'src/td/converter/ConverterPlugin.ts',
                    'src/td/converter/ConverterEvent.ts',
                    'src/td/converter/BasePath.ts',
                    'src/td/converter/events/CompilerEvent.ts',
                    'src/td/converter/events/ResolveEvent.ts',
                    'src/td/converter/plugins/CommentPlugin.ts',
                    'src/td/converter/plugins/DynamicModulePlugin.ts',
                    'src/td/converter/plugins/GroupPlugin.ts',
                    'src/td/converter/plugins/PackagePlugin.ts',
                    'src/td/converter/plugins/SourcePlugin.ts',
                    'src/td/models/comments/Comment.ts',
                    'src/td/models/comments/CommentTag.ts',
                    'src/td/models/reflections/Reflection.ts',
                    'src/td/models/reflections/ContainerReflection.ts',
                    'src/td/models/reflections/DeclarationReflection.ts',
                    'src/td/models/reflections/ProjectReflection.ts',
                    'src/td/models/reflections/SignatureReflection.ts',
                    'src/td/models/reflections/ParameterReflection.ts',
                    'src/td/models/reflections/ReflectionGroup.ts',
                    'src/td/models/sources/SourceDirectory.ts',
                    'src/td/models/sources/SourceFile.ts',
                    'src/td/models/types/Type.ts',
                    'src/td/models/types/IntrinsicType.ts',
                    'src/td/models/types/ReferenceType.ts',
                    'src/td/models/types/ReflectionType.ts',
                    'src/td/models/types/StringLiteralType.ts',
                    'src/td/models/types/TupleType.ts',
                    'src/td/models/types/TypeParameterType.ts',
                    'src/td/models/types/UnknownType.ts',
                    'src/td/models/renderer/NavigationItem.ts',
                    'src/td/models/renderer/UrlMapping.ts',
                    'src/td/output/BasePlugin.ts',
                    'src/td/output/BaseTheme.ts',
                    'src/td/output/DefaultTheme.ts',
                    'src/td/output/Renderer.ts',
                    'src/td/output/events/OutputEvent.ts',
                    'src/td/output/events/OutputPageEvent.ts',
                    'src/~bootstrap.ts'
                ],
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
};