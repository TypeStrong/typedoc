export abstract class Base {
    /**
     * Base
     */
    abstract get getter(): string;
}

export class Derived extends Base {
    /**
     * @inheritdoc
     */
    public get getter() {
        return "";
    }
}
