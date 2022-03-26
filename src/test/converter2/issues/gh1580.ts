export { B, A };

class A {
    /** Prop docs */
    prop!: string;

    /** Run docs */
    run(): void {}
}

class B extends A {
    declare prop: "B";

    run(): void {
        super.run();
    }
}
