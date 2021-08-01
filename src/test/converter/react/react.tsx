/** @jsx React.createElement */
declare namespace React {
    namespace JSX {
        interface IntrinsicElements {
            [x: string]: any;
        }
    }

    function createElement(): any;
}

export interface DemoProps {
    name: string;
    age: number;
}

export class Demo {
    private foo: number;

    constructor(props: DemoProps) {
        this.foo = props.age;
        this.foo;
    }

    render() {
        return <div>Hello world!</div>;
    }
}
