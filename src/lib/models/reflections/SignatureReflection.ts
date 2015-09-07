module td.models
{
    export class SignatureReflection extends Reflection implements ITypeContainer, ITypeParameterContainer
    {
        parent:ContainerReflection;

        parameters:ParameterReflection[];

        typeParameters:TypeParameterReflection[];

        type:Type;

        /**
         * A type that points to the reflection that has been overwritten by this reflection.
         *
         * Applies to interface and class members.
         */
        overwrites:Type;

        /**
         * A type that points to the reflection this reflection has been inherited from.
         *
         * Applies to interface and class members.
         */
        inheritedFrom:Type;

        /**
         * A type that points to the reflection this reflection is the implementation of.
         *
         * Applies to class members.
         */
        implementationOf:Type;



        /**
         * Return an array of the parameter types.
         */
        getParameterTypes():Type[] {
            if (!this.parameters) return [];
            return this.parameters.map((parameter:models.ParameterReflection) => parameter.type);
        }


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

            if (this.typeParameters) {
                this.typeParameters.forEach((parameter) => callback(parameter, TraverseProperty.TypeParameter));
            }

            if (this.parameters) {
                this.parameters.forEach((parameter) => callback(parameter, TraverseProperty.Parameters));
            }

            super.traverse(callback);
        }


        /**
         * Return a raw object representation of this reflection.
         */
        toObject():any {
            var result = super.toObject();

            if (this.type) {
                result.type = this.type.toObject();
            }

            if (this.overwrites) {
                result.overwrites = this.overwrites.toObject();
            }

            if (this.inheritedFrom) {
                result.inheritedFrom = this.inheritedFrom.toObject();
            }

            if (this.implementationOf) {
                result.implementationOf = this.implementationOf.toObject();
            }

            return result;
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