module TypeDoc.Factories
{
    export class ResolveProjectEvent extends Event
    {
        compiler:Compiler;

        project:Models.ProjectReflection;


        constructor(compiler:Compiler, project:Models.ProjectReflection) {
            super();
            this.compiler = compiler;
            this.project = project;
        }


        createReflectionEvent(reflection:Models.DeclarationReflection):ResolveReflectionEvent {
            return new ResolveReflectionEvent(this.compiler, this.project, reflection)
        }
    }
}