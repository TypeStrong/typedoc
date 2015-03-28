/// <reference path="../lib.core.d.ts" />

/**
 * TestClass comment short text.
 *
 * TestClass comment text.
 *
 * @see [[TestClass]] @ fixtures
 */
export class TestClass {

    /**
     * publicProperty short text.
     */
    public publicProperty:string;

    /**
     * privateProperty short text.
     */
    private privateProperty:number[];

    /**
     * privateProperty short text.
     */
    static staticProperty:TestClass;


    /**
     * Constructor short text.
     */
    constructor() { }

    /**
     * publicMethod short text.
     */
    public publicMethod() {}

    /**
     * protectedMethod short text.
     */
    protected protectedMethod() {}

    /**
     * privateMethod short text.
     */
    private privateMethod() {}

    /**
     * staticMethod short text.
     */
    static staticMethod() {}
}


export class TestSubClass extends TestClass
{
    /**
     * publicMethod short text.
     */
    public publicMethod() {}

    /**
     * protectedMethod short text.
     */
    protected protectedMethod() {}

    /**
     * Constructor short text.
     *
     * @param p1 Constructor param
     * @param p2 Private string property
     * @param p3 Public number property
     * @param p4 Public implicit any property
     */
    constructor(p1, private p2: string, public p3: number, public p4) {
        super();
    }
}