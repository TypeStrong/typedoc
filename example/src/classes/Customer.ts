/**
 * An abstract base class for the customer entity in our application.
 *
 * Notice how TypeDoc shows the inheritance hierarchy for our class.
 *
 * @category Model
 */
export abstract class Customer {
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
        this.doInternalStuff();
    }

    /** A public method. To be called when an order is placed for this customer. */
    onOrderPlaced(): void {
        this._nextOrderNumber++;
    }

    /**
     * A public method that's defined using an arrow function.
     *
     * TypeDoc knows to document this as a method rather than a property.
     */
    onOrderPlacedArrowFunction = (): void => {
        this._nextOrderNumber++;
    };

    /** A protected method. */
    protected isValid(): boolean {
        return this._nextOrderNumber >= 0;
    }

    /** A private method. */
    private doInternalStuff(): void {
        // does nothing
    }
}

/**
 * A class that extends {@link Customer | `Customer`}.
 */
export class DeliveryCustomer extends Customer {
    /** A property defined on the subclass. */
    preferredCourierId?: number;

    /** Another property defined on the subclass. */
    readonly subscriptionType: "basic" | "enterprise";

    /**
     * The constructor of the `DeliveryCustomer` class.
     *
     * @param id the customer's database ID
     * @param name the customer's name
     * @param nextOrderNumber the next number to use when this customer places an order
     * @param subscriptionType whether this customer has a basic or enterprise subscription
     */
    constructor(
        id: number,
        name: string,
        nextOrderNumber: string | number,
        subscriptionType: "basic" | "enterprise",
    ) {
        super(id, name, nextOrderNumber);
        this.subscriptionType = subscriptionType;
    }

    /**
     * An example of overriding a protected method.
     *
     * A `DeliveryCustomer` can only have a preferred courier if its
     * subscription type is enterprise.
     */
    protected isValid(): boolean {
        if (!super.isValid()) return false;
        if (this.subscriptionType === "enterprise") return true;

        return typeof this.preferredCourierId === "undefined";
    }
}
