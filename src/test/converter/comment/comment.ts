/**
 * Module doc comment with document and link to [self](./comment.ts) and {@link https://example.com}
 *
 * @document document.md
 * @packageDocumentation
 */
import "./comment2";

/**
 * A Comment for a class
 *
 * ## Some Markup
 * **with more markup**
 *
 * An example with decorators that should not parse to tag
 * ```
 * @myDecorator
 * @FactoryDecorator('a', 'b', 'c')
 * export class CommentedClass {
 *   myProp: string = 'myProp';
 *
 *   @PropDecorator() decoratedProp: string;
 *
 *   constructor(@ParamDecorator public param: string) { }
 *
 *   myMethod() { }
 * }
 * ```
 * @deprecated
 *
 * @type {Data<object>} will also be removed
 *
 * @groupDescription Methods
 * Methods description!
 */
export class CommentedClass {
    /**
     * The main prop
     */
    prop: string;

    /**
     * @hidden
     */
    hiddenprop: string;

    /**
     * Hidden function
     * @hidden
     */
    hidden(...args: any[]): void {}

    /**
     * Single hidden signature
     * @hidden
     */
    hiddenWithImplementation(arg: any);
    hiddenWithImplementation(...args: any[]): void {}

    /**
     * Multiple hidden 1
     * @hidden
     */
    multipleHidden(arg: any);
    /**
     * Multiple hidden 2
     * @hidden
     */
    multipleHidden(arg1: any, arg2: any);
    multipleHidden(...args: any[]): void {}

    /**
     * Mixed hidden 1
     * @hidden
     */
    mixedHidden(arg: any);
    /**
     * Mixed hidden 2
     */
    mixedHidden(arg1: any, arg2: any);
    mixedHidden(...args: any[]): void {}

    /**
     * @ignore
     */
    ignoredprop: string;
}

export type UnionWithCommentsOnMembers =
    /**
     * Doc of foo1.
     */
    | "foo1"
    /**
     * Doc of foo2.
     */
    | "foo2";
