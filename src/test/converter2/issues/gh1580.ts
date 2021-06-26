export { B, A };

class A {
    /** Prop docs */
    prop!: string;

    /** Run docs */
    run(): void {
        console.log("A");
    }
}

class B extends A {
    declare prop: "B";

    run(): void {
        super.run();
        console.log("B");
    }
}
