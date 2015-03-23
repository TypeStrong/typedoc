function f() {
    let total = 0;
    let x = 5;
    for (let x = 1; x < 10; x++) {
        total += x;
    }
    console.log(x);
}

var rectangle = { height: 20, width: 10 };
var areaMessage = `Rectangle area is ${rectangle.height * rectangle.width}`;


class Foo
{
    /**
     * A function that returns an object.
     * Also no type information is given, the object should be correctly reflected.
     */
    createSomething() {
        return {
            foo: 'bar',
            doSomething(a:number) { return a + 1},
            doAnotherThing() {}
        };
    }
}
