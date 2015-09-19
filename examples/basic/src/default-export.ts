/**
 * This class is exported under a different name. The exported name is
 * "ExportedClassName"
 * 
 * ```JavaScript
 * export {NotExportedClassName as ExportedClassName};
 * ```
 */
class NotExportedClassName
{
    /**
     * Property of not exported class.
     */
    public notExportedProperty:string;


    /**
     * This is the constructor of the not exported class.
     */
    constructor() { }


    /**
     * Method of not exported class.
     */
    public getNotExportedProperty():string {
        return this.notExportedProperty;
    }
}


/**
 * This class is exported via es6 export syntax.
 *
 * ```
 * export default class SingleExportedClass
 * ```
 */
export default class SingleExportedClass
{
    /**
     * Property of exported class.
     */
    public exportedProperty:string;


    /**
     * This is the constructor of the exported class.
     */
    constructor() { }


    /**
     * Method of exported class.
     */
    public getExportedProperty():string {
        return this.exportedProperty;
    }
}

export {NotExportedClassName as ExportedClassName};