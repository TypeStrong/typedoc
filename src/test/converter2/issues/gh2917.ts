export interface Foo {
    data: {
        [key: string]: any;
    };
    mixed: {
        (): string;
        a: string;
        [key: string]: any;
    };
}
