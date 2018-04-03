/// <reference path="../lib.core.d.ts" />

interface IConstructor {

    // No return type defined. Used the parent one.
    new(x:String, y:String);

    // A return type is defined and is the same as the parent one.
    new(x:String, y:String) : IConstructor;

    // A return type is defined and is not the same as the parent one.
    new(x:String, y:String) : IInstance;
}

interface IInstance {}
