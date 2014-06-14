/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/lunr.d.ts" />

declare module tsd.search
{
    interface IDocument {
        id:number;
        kind:number;
        name:string;
        url:string;
        parent?:string;
    }

    interface IData {
        kinds:{[kind:number]:string};
        rows:IDocument[];
    }

    var data:IData;
}