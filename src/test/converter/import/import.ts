/**
 * This is a NamespaceImport.
 */
import * as vars from '../variable/variable';

/**
 * This is a NamespaceImport.
 */
import * as enums from '../enum/enum';

/**
 * Those are NamedImports.
 */
import { SimpleEnum, ModuleEnum as MyEnum } from '../enum/enum';

/**
 * This is an ImportEqualsDeclaration.
 */
import z = require('../enum/enum');

/**
 * This is a side-effect-only import and does not create a reflection.
 */
import '../enum/enum';

/**
 * This is a NamespaceImport that imports the defaults of a module.
 */
import def from '../export-default/export-default';

/**
 * This is a namespace that is aliased later.
 */
namespace Foo
{
    /**
     * This is a variable of an enum type imported by a namespace import.
     */
    let simpleEnum: enums.SimpleEnum = enums.SimpleEnum.EnumValue1;

    /**
     * This is a variable of an enum type imported by a named import.
     */
    export const se = SimpleEnum.EnumValue2;

    /**
     * This is a variable of an enum type imported by a named import with a custom alias.
     */
    let mye: MyEnum = MyEnum.EnumValue3;

    /**
     * This is a variable of an enum type imported by an ImportEqualsDeclaration.
     */
    let zMe: z.ModuleEnum = z.ModuleEnum.EnumValue2;

    /**
     * This is a const that equals the default export of a module.
     */
    const defx = def;

    /**
     * This is a const that equals a type of an imported module.
     */
    const SimpleEnumType = enums.SimpleEnum;

    /**
     * This is a const that equals an exported variable of an imported module.
     */
    const varx = vars.myLet;
}

/**
 * This is an ImportEqualsDeclaration to a namespace.
 */
import foo = Foo;

/**
 * This is an exported ImportEqualsDeclaration to an exported member of the namespace.
 */
export import fooSe = Foo.se;

/**
 * This is a const to test type resolution.
 */
const fooxx = foo.se;
