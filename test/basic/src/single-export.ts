/**
 * This class is not exported.
 */
class NotExportedClass
{
    /**
     * This is the constructor of the not exported class.
     */
    constructor() { }
}


/**
 * This class is exported by being assigned to ´export´.
 *
 * ~~~
 * export = SingleExportedClass;
 * ~~~
 */
class SingleExportedClass
{
    /**
     * This is the constructor of the exported class.
     */
    constructor() { }
}


/**
 * The export statement.
 */
export = SingleExportedClass;