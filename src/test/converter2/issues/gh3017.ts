/**
 * Test class for issue #3017 - separate exclusion options for TS private and JS #private
 */
export class TestPrivateExclusion {
    /** Public field for reference */
    public publicField: string = "public";

    /** TypeScript private field */
    private tsPrivateField: string = "ts-private";

    /** JavaScript private class field */
    #jsPrivateField: string = "js-private";

    /** Private method using TypeScript syntax */
    private tsPrivateMethod(): void {
        console.log("TS private method");
    }

    /** Private method using JavaScript syntax */
    #jsPrivateMethod(): void {
        console.log("JS private method");
    }

    /** Protected field for comparison */
    protected protectedField: string = "protected";

    /** Public method that uses private fields */
    public usePrivateFields(): void {
        console.log(this.tsPrivateField);
        console.log(this.#jsPrivateField);
        this.tsPrivateMethod();
        this.#jsPrivateMethod();
    }
}

/**
 * Another test class with various privacy levels
 */
export class AdvancedPrivateTest {
    private _conventionalPrivate: number = 1;
    #realPrivate: number = 2;
    
    private get privateGetter(): number {
        return this._conventionalPrivate;
    }
    
    private set privateSetter(value: number) {
        this._conventionalPrivate = value;
    }

    #getRealPrivate(): number {
        return this.#realPrivate;
    }

    #setRealPrivate(value: number): void {
        this.#realPrivate = value;
    }
}