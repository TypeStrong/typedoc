module td
{
    export class SignatureReflection extends Reflection implements ISourceContainer, ICommentContainer, ITypeContainer, ITypeParameterContainer
    {
        parent:ContainerReflection;

        comment:Comment;

        sources:ISourceReference[];

        parameters:ParameterReflection[];

        typeParameters:TypeParameterType[];

        type:Type;


        toString() {
            return super.toString() + (this.type ? ':' + this.type.toString() :  '');
        }


        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];
            indent += '  ';

            if (this.typeParameters) {
                this.typeParameters.forEach((n) => { lines.push(indent + n.toString()); });
            }

            if (this.type instanceof ReflectionType) {
                lines.push((<ReflectionType>this.type).declaration.toStringHierarchy(indent));
            }

            if (this.parameters) {
                this.parameters.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            return lines.join('\n');
        }
    }
}