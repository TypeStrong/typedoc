module TypeDoc.Factories
{
    export class ProjectResolution extends Event
    {
        compiler:Compiler;

        project:Models.ProjectReflection;


        constructor(compiler:Compiler, project:Models.ProjectReflection) {
            super();
            this.compiler = compiler;
            this.project = project;
        }
    }


    export class ReflectionResolution extends ProjectResolution
    {
        reflection:Models.DeclarationReflection;


        constructor(compiler:Compiler, project:Models.ProjectReflection, reflection?:Models.DeclarationReflection) {
            super(compiler, project);
            this.reflection = reflection;
        }
    }
}