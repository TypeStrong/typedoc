module TypeDoc.Factories
{
    export class ResolveReflectionEvent extends ResolveProjectEvent
    {
        reflection:Models.DeclarationReflection;


        constructor(compiler:Compiler, project:Models.ProjectReflection, reflection?:Models.DeclarationReflection) {
            super(compiler, project);
            this.reflection = reflection;
        }
    }
}