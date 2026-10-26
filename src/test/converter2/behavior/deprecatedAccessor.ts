export class Test {
    /** @deprecated */
    get getterOnly() {
        return 1;
    }

    set setterOnly(v: number) {}

    /** @deprecated */
    get both() {
        return 1;
    }
    /** @deprecated */
    set both(v: number) {}

    get mixed() {
        return 1;
    }
    /** @deprecated */
    set mixed(v: number) {}

    get notDeprecated() {
        return 1;
    }
    set notDeprecated(v: number) {}
}
