/**
 * ...
 */

/**
 * This is a module.
 */
export module MyModule
{
    /**
     * This is an object literal.
     */
    export var object = {
        /**
         * An object literal value.
         */
        name: 'Test',

        /**
         * An object literal function.
         */
        print: function(value:string) { }
    };


    /**
     * This is a submodule.
     */
    export module MySubmodule
    {
        var a:string;
    }


    export var exportedModuleVariable = 'foo';

    var moduleVariable = [100, 200];

    var moduleVariable2:number[];
}

/**
 * This is a submodule with the preferred comment.
 * @preferred
 */
export module MyModule.MySubmodule
{
    var b:string;
}

/**
 * An exported global variable.
 */
export var exportedGlobalVariable = 'foo';

/**
 * A non-exported global variable.
 */
var globalVariable = 'foo';

/**
 * An object literal.
 */
var objectLiteral = {
    valueZ: 'foo',
    valueY: function() { return 'foo'; },
    valueX: {
        valueZ: 'foo',
        valueY: (z:string) => { return {a:'test', b:z}; },
        valueA: [100, 200, 300]
    },
    valueA: 100,
    valueB: true
};

var typeLiteral:{
    ():string;
    valueZ:string;
    valueY:{():string;};
    valueX:{
        valueZ:string;
        valueY:{(z:string):{a:string; b:string}; };
        valueA:number[];
    };
    valueA?:number;
    valueB?:boolean;
};