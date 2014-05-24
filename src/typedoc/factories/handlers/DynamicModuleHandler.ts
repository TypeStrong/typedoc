module TypeDoc.Factories
{
    export class DynamicModuleHandler
    {
        private basePath = new BasePath();


        constructor(dispatcher:Dispatcher) {
            dispatcher.on('process', this.onProcess, this);
            dispatcher.on('resolveReflection', this.onResolveReflection, this);
        }


        private onProcess(state:DeclarationState) {
            if (!state.kindOf(Models.Kind.DynamicModule)) {
                return;
            }

            var name = state.declaration.name;
            name = name.replace(/"/g, '');
            state.reflection.name = name.substr(0, name.length - Path.extname(name).length);
            this.basePath.add(name);
        }


        private onResolveReflection(reflection:Models.DeclarationReflection) {
            if (!reflection.kindOf(Models.Kind.DynamicModule)) {
                return;
            }

            reflection.name = this.basePath.trim(reflection.name);
        }
    }


    Dispatcher.FACTORIES.push(DynamicModuleHandler);
}