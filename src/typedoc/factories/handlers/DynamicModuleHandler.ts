module TypeDoc.Factories
{
    export class DynamicModuleHandler extends BaseHandler
    {
        private basePath = new BasePath();


        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_DECLARATION, this.onProcess, this);
            dispatcher.on(Dispatcher.EVENT_RESOLVE, this.onResolveReflection, this);
        }


        private onProcess(state:DeclarationState) {
            if (!state.kindOf([Models.Kind.DynamicModule, Models.Kind.Script])) {
                return;
            }

            var name = state.declaration.name;
            name = name.replace(/"/g, '');
            state.reflection.name = name.substr(0, name.length - Path.extname(name).length);

            if (name.indexOf('/') != -1) {
                this.basePath.add(name);
            }
        }


        private onResolveReflection(res:ReflectionEvent) {
            var reflection = res.reflection;
            if (reflection.kindOf([Models.Kind.DynamicModule, Models.Kind.Script])) {
                if (reflection.name.indexOf('/') != -1) {
                    reflection.name = this.basePath.trim(reflection.name);
                }
            }
        }
    }


    Dispatcher.HANDLERS.push(DynamicModuleHandler);
}