export class Book {
    /**
     * Technically property has a setter, but for documentation purposes it should
     * be presented as readonly.
     * @readonly
     */
    get title(): string {
        return "hah";
    }

    set title(_value: string) {
        throw new Error("This property is read-only!");
    }

    /**
     * Should be documented as readonly because no consumer should change it.
     * @readonly
     */
    author!: string;
}
