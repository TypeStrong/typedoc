/**
 * Description
 * @class
 * @category Bug
 */
export declare const Bug1: new () => { x: string };

/** @class */
export declare const Bug2: new (x: string) => {};

/** @class */
export declare const Bug3: new <T extends string>() => {
    x: T;
};

/** @class */
export declare const Bug4: new <T extends () => U, U extends string>(x: T) => T;
