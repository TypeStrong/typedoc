module td
{
    export class ParameterReflection extends Reflection implements ICommentContainer, IDefaultValueContainer, ITypeContainer
    {
        parent:SignatureReflection;

        comment:Comment;

        defaultValue:string;

        type:Type;

        isOptional:boolean;


        toString() {
            return super.toString() + (this.type ? ':' + this.type.toString() :  '');
        }


        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];
            indent += '  ';

            if (this.type instanceof ReflectionType) {
                lines.push((<ReflectionType>this.type).declaration.toStringHierarchy(indent));
            }

            return lines.join('\n');
        }
    }
}