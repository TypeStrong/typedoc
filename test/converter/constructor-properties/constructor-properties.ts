/// <reference path="../lib.core.d.ts" />


/**
 * A class with constructor properties.
 */
class Vector2
{
    /**
     * @param x  X component of the Vector
     * @param y  Y component of the Vector
     */
    constructor(public x:number, public y:number) {
    }
}


/**
 * A class with inherited and overwritten constructor properties.
 */
class Vector3 extends Vector2
{
    /**
     * @param x  X component of the Vector
     * @param y  Y component of the Vector
     * @param z  Z component of the Vector
     */
    constructor(x:number, public y:number, public z:number) {
        super(x, y);
    }
}