export class Test {
    get x() {
        return 1;
    }

    get y() {
        return 1;
    }
    /** @hidden */
    set y(v) {}

    /** @hidden */
    get z() {
        return 1;
    }

    accessor auto!: string;

    /** @hidden */
    accessor autoHidden!: string;
}
