declare module "minimatch" {
    module minimatch {
        interface IMinimatchOptions {
            debug?:boolean;
            nobrace?:boolean;
            noglobstar?:boolean;
            dot?:boolean;
            noext?:boolean;
            nocase?:boolean;
            nonull?:boolean;
            matchBase?:boolean;
            nocomment?:boolean;
            nonegate?:boolean;
            flipNegate?:boolean;
        }


        class Minimatch {
            constructor(pattern:string, options:IMinimatchOptions);
            makeRe():RegExp;
            match(fname:string):boolean;
        }
    }

    export = minimatch;
}