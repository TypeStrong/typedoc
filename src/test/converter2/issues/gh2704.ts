export type Foo = Bar<123>;

/** @ignore */
export type Bar<T> = T extends 123 ? true : false;
