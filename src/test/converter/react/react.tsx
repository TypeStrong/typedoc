/// <reference path="react.d.ts" />

import * as React from "react";


interface DemoProps {
    name:string;
    age:number;
}


class Demo extends React.Component<DemoProps, any>
{
    private foo:number;


    constructor(props:DemoProps) {
        super(props);
        this.foo = 42;
    }


    render() {
        return (
            <div>Hello world!</div>
        );
    }
}
