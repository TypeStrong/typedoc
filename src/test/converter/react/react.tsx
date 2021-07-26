declare const React: unknown;

export interface DemoProps {
    name: string;
    age: number;
}

export class Demo {
    private foo: number;

    constructor(_props: DemoProps) {
        this.foo = 42;
        this.foo; // suppress "declared but value never read"
    }

    render() {
        return <div>Hello world!</div>;
    }
}
