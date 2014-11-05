function test<T>(value:T):T {
    return value;
}

interface A<T> {
    getT():T;
}

interface B<T, C> {
    setT(value:T):void;
    getC():C;
}

interface AB<T> extends A<T>, B<T, boolean> {}

interface ABString extends AB<string> {}

interface ABNumber extends AB<number> {}