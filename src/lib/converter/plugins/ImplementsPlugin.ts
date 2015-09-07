module td.converter
{
    /**
     * A plugin that detects interface implementations of functions and
     * properties on classes and links them.
     */
    export class ImplementsPlugin extends ConverterPlugin
    {
        /**
         * Create a new ImplementsPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);
            converter.on(Converter.EVENT_RESOLVE, this.onResolve, this, -10);
        }


        /**
         * Mark all members of the given class to be the implementation of the matching interface member.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param classReflection  The reflection of the classReflection class.
         * @param interfaceReflection  The reflection of the interfaceReflection interface.
         */
        private analyzeClass(context:Context, classReflection:models.DeclarationReflection, interfaceReflection:models.DeclarationReflection) {
            interfaceReflection.children.forEach((interfaceMember:models.DeclarationReflection) => {
                if (!(interfaceMember instanceof models.DeclarationReflection)) {
                    return;
                }

                var classMember:models.DeclarationReflection;
                for (var index = 0, count = classReflection.children.length; index < count; index++) {
                    var child = classReflection.children[index];
                    if (child.name != interfaceMember.name) continue;
                    if (child.flags.isStatic != interfaceMember.flags.isStatic) continue;

                    classMember = child;
                    break;
                }

                if (!classMember) {
                    return;
                }

                var interfaceMemberName = interfaceReflection.name + '.' + interfaceMember.name;
                classMember.implementationOf = new models.ReferenceType(interfaceMemberName, models.ReferenceType.SYMBOL_ID_RESOLVED, interfaceMember);
                this.copyComment(classMember, interfaceMember);

                if (interfaceMember.kindOf(models.ReflectionKind.FunctionOrMethod) && interfaceMember.signatures && classMember.signatures) {
                    interfaceMember.signatures.forEach((interfaceSignature:models.SignatureReflection) => {
                        var interfaceParameters = interfaceSignature.getParameterTypes();
                        classMember.signatures.forEach((classSignature:models.SignatureReflection) => {
                            if (models.Type.isTypeListEqual(interfaceParameters, classSignature.getParameterTypes())) {
                                classSignature.implementationOf = new models.ReferenceType(interfaceMemberName, models.ReferenceType.SYMBOL_ID_RESOLVED, interfaceSignature);
                                this.copyComment(classSignature, interfaceSignature);
                            }
                        });
                    });
                }
            });
        }


        /**
         * Copy the comment of the source reflection to the target reflection.
         *
         * @param target
         * @param source
         */
        private copyComment(target:models.Reflection, source:models.Reflection) {
            if (target.comment && source.comment && target.comment.hasTag('inheritdoc')) {
                target.comment.copyFrom(source.comment);

                if (target instanceof models.SignatureReflection && target.parameters &&
                    source instanceof models.SignatureReflection && source.parameters) {
                    for (var index = 0, count = target.parameters.length; index < count; index++) {
                        target.parameters[index].comment.copyFrom(source.parameters[index].comment);
                    }
                }
            }
        }


        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context:Context, reflection:models.DeclarationReflection) {
            if (reflection.kindOf(models.ReflectionKind.Class) && reflection.implementedTypes) {
                reflection.implementedTypes.forEach((type:models.Type) => {
                    if (!(type instanceof models.ReferenceType)) {
                        return;
                    }

                    var source = <models.DeclarationReflection>(<models.ReferenceType>type).reflection;
                    if (source && source.kindOf(models.ReflectionKind.Interface)) {
                        this.analyzeClass(context, reflection, source);
                    }
                });
            }
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('implements', ImplementsPlugin);
}