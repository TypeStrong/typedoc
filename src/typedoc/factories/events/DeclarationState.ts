module TypeDoc.Factories
{
    /**
     */
    export class DeclarationState extends BaseState
    {
        reflection:Models.DeclarationReflection;

        flattenedName:string = '';

        isSignature:boolean = false;

        isInherited:boolean = false;

        isFlattened:boolean = false;


        /**
         * @inherit
         */
        createChildState(declaration:TypeScript.PullDecl):DeclarationState {
            var state = super.createChildState(declaration);
            state.isInherited = this.isInherited;
            state.isFlattened = this.isFlattened;

            if (state.isInherited) {
                state.reflection = this.reflection.getChildByName(BaseState.getName(declaration));
            }

            if (state.isFlattened) {
                state.parentState   = this.parentState;
                state.flattenedName = this.flattenedName + '.' + declaration.name;
            }

            return state;
        }


        /**
         * Create a child state of this state with the given declaration.
         */
        createSignatureState():DeclarationState {
            if (!this.reflection) {
                throw new Error('Cannot create a signature state of state without a reflection.');
            }

            var state = new DeclarationState(this, this.declaration);
            state.isSignature = true;
            state.isInherited = this.isInherited;
            state.isFlattened = this.isFlattened;
            return state;
        }


        createInheritanceState(declaration:TypeScript.PullDecl) {
            if (!this.reflection) {
                throw new Error('Cannot create a signature state of state without a reflection.');
            }

            var state = new DeclarationState(this, declaration);
            state.reflection  = this.reflection;
            state.isInherited = true;
            return state;
        }
    }
}