/**
 * The customer entity in our application. This is an example of a basic class.
 */
export class Customer {
    /** A public readonly property. */
    readonly id: number;

    /** A public property that can be reassigned. */
    name: string;

    /** An optional protected property. */
    protected contactName?: string;

    /** A private property that is accessed via a getter and setter. */
    private _nextOrderNumber = 0;

    /**
     * A getter that prepends a number sign to the private `_nextOrderNumber`
     * property.
     */
    get nextOrderNumber(): string {
        return `#${this._nextOrderNumber}`;
    }

    /**
     * A setter that takes in either a string or a number and sets the private
     * `_nextOrderNumber` property.
     */
    set nextOrderNumber(value: string | number) {
        if (typeof value === "number") {
            this._nextOrderNumber = value;
        } else {
            this._nextOrderNumber = parseInt(value.replace(/#/g, ""));
        }
    }

    /**
     * The constructor of the `Customer` class.
     *
     * @param id the customer's database ID
     * @param name the customer's name
     * @param nextOrderNumber the next number to use when this customer places an order
     */
    constructor(id: number, name: string, nextOrderNumber: string | number) {
        this.id = id;
        this.name = name;
        this.nextOrderNumber = nextOrderNumber;
    }
}
