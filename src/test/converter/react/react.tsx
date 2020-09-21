declare const React: unknown;

interface DemoProps {
    name: string;
    age: number;
}

class Demo {
    private foo: number;

    constructor(props: DemoProps) {
        this.foo = 42;
    }

    render() {
        return <div>Hello world!</div>;
    }
}
