/**
 * Base class of all type definitions.
 *
 * Instances of this class are also used to represent the type `void`.
 */
export abstract class Type {

    /**
     * The type name identifier.
     */
    readonly type: string = 'void';

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    abstract clone(): Type;

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: Type): boolean {
        return false;
    }

    /**
     * Return a raw object representation of this type.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        let result: any = {};
        result.type = this.type;

        return result;
    }

    /**
     * Return a string representation of this type.
     */
    toString(): string {
        return 'void';
    }

    /**
     * Test whether the two given list of types contain equal types.
     *
     * @param a
     * @param b
     */
    static isTypeListSimiliar(a: Type[], b: Type[]): boolean {
        if (a.length !== b.length) {
            return false;
        }
        outerLoop: for (let an = 0, count = a.length; an < count; an++) {
            const at = a[an];
            for (let bn = 0; bn < count; bn++) {
                if (b[bn].equals(at)) {
                    continue outerLoop;
                }
            }

            return false;
        }

        return true;
    }

    /**
     * Test whether the two given list of types are equal.
     *
     * @param a
     * @param b
     */
    static isTypeListEqual(a: Type[], b: Type[]): boolean {
        if (a.length !== b.length) {
            return false;
        }
        for (let index = 0, count = a.length; index < count; index++) {
            if (!a[index].equals(b[index])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Test whether the first type list can be assigned from the second type list.
     *
     * @param a  The type list to assign to (Parameter list of overridden method for example).
     * @param b  The type list to assign from (Parameter list of extending method for example).
     * @return True if second type list can be assigned to the first type list.
     */
    static isTypeListAssignable(a: Type[], b: Type[]): boolean {
        // When not enough types are present in second list then it is not assignable
        if (a.length > b.length) {
            return false;
        }
        // For each type in first list check if it is assignable from corresponding type of second list
        for (let index = 0, count = a.length; index < count; index++) {
            if (!a[index].isAssignableFrom(b[index])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Test whether the given type can be assigned to this type.
     *
     * @param type  The type to check.
     * @return True if specified type can be assigned to this type, false if not.
     */
    isAssignableFrom(type: Type): boolean {
        if (type.isTypeWrapper()) {
            return type.isAssignableTo(this);
        } else {
            return this.equals(type);
        }
    }

    /**
     * Test whether this type can be assigned to the given type.
     *
     * @param type  The type to check.
     * @return True if this type can be assigned to the given type, false if not.
     */
    isAssignableTo(type: Type): boolean {
        if (type.isTypeWrapper()) {
            return type.isAssignableFrom(this);
        } else {
            return this.equals(type);
        }
    }

    /**
     * Test wether this type wraps other types.
     *
     * @return True if this type wraps other types, false if not.
     */
    isTypeWrapper(): boolean {
        return false;
    }
}
