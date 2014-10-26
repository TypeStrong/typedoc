module TypeDoc.Factories
{
    export class InheritanceHandler extends BaseHandler
    {
        /**
         * Create a new InheritanceHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_CREATE_REFLECTION, this.onCreateReflection, this);
            dispatcher.on(Dispatcher.EVENT_MERGE_REFLECTION,  this.onMergeReflection,  this);
            dispatcher.on(Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 1024);
            dispatcher.on(Dispatcher.EVENT_END_DECLARATION,   this.onEndDeclaration,   this);
        }


        /**
         * Triggered when the dispatcher creates a new reflection instance.
         *
         * Sets [[DeclarationReflection.inheritedFrom]] on inherited members.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onCreateReflection(state:DeclarationState) {
            if (state.isInherited) {
                state.reflection.inheritedFrom = new Models.LateResolvingType(state.declaration);
            }
        }


        /**
         * Triggered when the dispatcher merges an existing reflection with a new declaration.
         *
         * Sets [[DeclarationReflection.overwrites]] on overwritten members.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onMergeReflection(state:DeclarationState) {
            if (state.isInherited) {
                var isOverwrite =
                    !state.reflection.inheritedFrom &&
                    !state.kindOf([Models.Kind.Class, Models.Kind.Interface]);

                if (isOverwrite) {
                    state.reflection.overwrites = new Models.LateResolvingType(state.declaration);
                    state.preventDefault();
                }
            }
        }


        /**
         * Triggered when the dispatcher starts processing a declaration.
         *
         * Prevents private and static members from being inherited.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDeclaration(state:DeclarationState) {
            if (state.isInherited) {
                var preventInheritance =
                    state.hasFlag(TypeScript.PullElementFlags.Private) ||
                    state.hasFlag(TypeScript.PullElementFlags.Static);

                if (preventInheritance) {
                    state.preventDefault();
                    state.stopPropagation();
                }
            }
        }


        /**
         * Triggered when the dispatcher has finished processing a declaration.
         *
         * Emits an additional [[DeclarationState]] for each extended type on the current
         * reflection.
         *
         * Sets [[DeclarationReflection.extendedBy]] and [[DeclarationReflection.extendedTypes]].
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onEndDeclaration(state:DeclarationState) {
            if (state.isInherited) {
                return;
            }

            var symbol = <TypeScript.PullTypeSymbol>state.declaration.getSymbol();
            if (!(symbol instanceof TypeScript.PullTypeSymbol)) {
                return;
            }

            InheritanceHandler.collectExtendedTypes(symbol).forEach((declaration) => {
                this.dispatcher.processState(state.createInheritanceState(declaration));
            });

            var extendedBy = symbol.getTypesThatExtendThisType();
            if (extendedBy.length > 0) {
                if (!state.reflection.extendedBy) state.reflection.extendedBy = [];
                extendedBy.forEach((symbol) => {
                    state.reflection.extendedBy.push(new Models.LateResolvingType(symbol));
                });
            }

            var extendedTypes = symbol.getExtendedTypes();
            if (extendedTypes.length > 0) {
                if (!state.reflection.extendedTypes) state.reflection.extendedTypes = [];
                extendedTypes.forEach((symbol) => {
                    state.reflection.extendedTypes.push(new Models.LateResolvingType(symbol));
                });
            }
        }


        /**
         * Create a list of all declarations that are super declarations the given symbol.
         *
         * @param symbol  The symbol whose parent declarations should be found.
         * @returns       A list of declarations that serve as parent declarations for the given symbol.
         */
        static collectExtendedTypes(symbol:TypeScript.PullTypeSymbol):TypeScript.PullDecl[] {
            var result = [];
            var symbols = [symbol];

            function process(symbol:TypeScript.PullTypeSymbol) {
                symbol.getExtendedTypes().forEach((extended) => {
                    extended.getDeclarations().forEach((declaration) => {
                        if (result.indexOf(declaration) != -1) {
                            return;
                        }

                        result.push(declaration);

                        var symbol = <TypeScript.PullTypeSymbol>declaration.getSymbol();
                        if (symbol instanceof TypeScript.PullTypeSymbol) {
                            symbols.push(symbol);
                        }
                    });
                });
            }

            while (symbols.length > 0) {
                var processing = symbols.splice(0);
                symbols.length = 0;
                processing.forEach(process);
            }

            return result;
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(InheritanceHandler);
}