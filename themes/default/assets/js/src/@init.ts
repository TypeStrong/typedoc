/// <reference path="lib/tsd.d.ts" />

declare module tsd.search
{
    interface IDocument {
        id:number;
        kind:number;
        name:string;
        url:string;
        classes:string;
        parent?:string;
    }

    interface IData {
        kinds:{[kind:number]:string};
        rows:IDocument[];
    }

    var data:IData;
}