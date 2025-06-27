class Class {
    msg: string;

    constructor(msg: string) {
        this.msg = msg;
    }
}

const Var = 123;

function Func<T>(a: T) {}

export { type Class, type Func, type Var };

class Class2 {}
const Var2 = 123;
function Func2() {}
export type { Class2, Func2, Var2 };
