export class Foo {
    get foo(): Bar {
        return new Bar();
    }
}

class Bar {}
