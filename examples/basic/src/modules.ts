/**
 * This is a module. Unfortunately TypeScript does not parse comments above modules.
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
        print: function(value:string) {
            console.log(value);
        }
    };


    export module MySubmodule
    {

    }


    export var exportedModuleVariable = 'foo';

    var moduleVariable = [100, 200];

    var moduleVariable2:number[];
}


export var exportedGlobalVariable = 'foo';

var globalVariable = 'foo';

var objectLiteral = {
    valueZ: 'foo',
    valueY: function() { return 'foo'; },
    valueX: {
        valueZ: 'foo',
        valueY: (z:string) => { return {a:'test', b:z}; }
    },
    valueA: 100,
    valueB: true
};