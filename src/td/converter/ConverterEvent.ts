module td
{
    export class ConverterEvent extends Event
    {
        private _checker:ts.TypeChecker;

        private _project:ProjectReflection;

        private _settings:Settings;


        constructor(checker:ts.TypeChecker, project:ProjectReflection, settings:Settings) {
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


        getSettings():Settings {
            return this._settings;
        }
    }
}