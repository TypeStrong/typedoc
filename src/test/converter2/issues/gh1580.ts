// Export order matters here. We want TypeDoc to process `B` before `A` so that the
// implements plugin has to defer handling of `B`
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
