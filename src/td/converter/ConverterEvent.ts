module td
{
    export class ConverterEvent extends Event
    {
        private _checker:ts.TypeChecker;

        private _project:ProjectReflection;

        private _settings:IOptions;


        constructor(checker:ts.TypeChecker, project:ProjectReflection, settings:IOptions) {
            super();
            this._checker = checker;
            this._project = project;
            this._settings = settings;
        }


        getTypeChecker():ts.TypeChecker {
            return this._checker;
        }


        getProject():ProjectReflection {
            return this._project;
        }


        getSettings():IOptions {
            return this._settings;
        }
    }
}