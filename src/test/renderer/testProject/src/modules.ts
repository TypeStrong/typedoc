/**
 * This is a module.
 */
export module MyModule {
    /**
     * This is an object literal.
     */
    export let object = {
        /**
         * An object literal value.
         */
        name: "Test",

        /**
         * An object literal function.
         */
        print: function (value: string) {},
    };

    /**
     * This is a submodule.
     */
    export module MySubmodule {
        let a: string;
    }

    export let exportedModuleVariable = "foo";
}

/**
 * This is a submodule with the preferred comment.
 * @preferred
 */
export module MyModule.MySubmodule {
    let b: string;
}

/**
 * An exported global variable.
 */
export let exportedGlobalVariable = "foo";

/**
 * An object literal.
 */
export let objectLiteral = {
    valueZ: "foo",
    valueY: function () {
        return "foo";
    },
    valueX: {
        valueZ: "foo",
        valueY: (z: string) => {
            return { a: "test", b: z };
        },
        valueA: [100, 200, 300],
    },
    valueA: 100,
    valueB: true,
};

export let typeLiteral: {
    (): string;
    valueZ: string;
    valueY: { (): string };
    valueX: {
        valueZ: string;
        valueY: { (z: string): { a: string; b: string } };
        valueA: number[];
    };
    valueA?: number;
    valueB?: boolean;
};

export type NamedTuple = [name: string, optionalName?: number];
