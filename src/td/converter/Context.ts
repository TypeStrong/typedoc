module td
{
    /**
     *
     */
    export class Context
    {
        private project:ProjectReflection;

        private scope:Reflection;



        constructor(project:ProjectReflection) {
            this.project = project;
            this.scope = project;
        }


        public getScope():Reflection {
            return this.scope;
        }


        public withScope(newScope:Reflection, callback:Function) {
            if (!newScope) return;

            var oldScope = this.scope;
            this.scope = newScope;
            callback();
            this.scope = oldScope;
        }
    }
}