module td
{
    export class SignatureReflection extends Reflection implements ITypeContainer, ITypeParameterContainer
    {
        parent:ContainerReflection;

        parameters:ParameterReflection[];

        typeParameters:TypeParameterType[];

        type:Type;


        /**
         * Traverse all potential child reflections of this reflection.
         *
         * The given callback will be invoked for all children, signatures and type parameters
         * attached to this reflection.
         *
         * @param callback  The callback function that should be applied for each child reflection.
         */
        traverse(callback:ITraverseCallback) {
            if (this.type instanceof ReflectionType) {
                callback((<ReflectionType>this.type).declaration, TraverseProperty.TypeLiteral);
            }

            if (this.parameters) {
                this.parameters.forEach((parameter) => callback(parameter, TraverseProperty.Parameters));
            }

            super.traverse(callback);
        }


        /**
         * Return a string representation of this reflection.
         */
        toString():string {
            var result = super.toString();

            if (this.typeParameters) {
                var parameters = [];
                this.typeParameters.forEach((parameter) => parameters.push(parameter.name));
                result += '<' + parameters.join(', ') + '>';
            }

            if (this.type) {
                result += ':' + this.type.toString();
            }

            return result;
        }
    }
}