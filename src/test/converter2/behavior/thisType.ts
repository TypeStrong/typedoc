export class ThisClass {
    // TypeDoc documents as returning `this`
    returnThis(): this {
        return this;
    }

    // TypeDoc documents as accepting `this`
    paramThis(x: this) {}

    // TypeDoc documents as containing `ThisClass`
    prop!: this;

    // TypeDoc documents as returning `ThisClass`
    returnThisImplicit() {
        return this;
    }
}
