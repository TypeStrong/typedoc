
/**
 * A wrapper class for either an Ok result or a resulting Err.
 * Modeled after Rust's std::result::Result type.
 */
export class Result<T, E> {
    /**
     * Construct with the result of a successful operation.
     * @param data
     */
    static Ok<T, E = unknown>(data: T) {
        return new Result<T, E>([true, data]);
    }

    /**
     * Construct with the result of an unsuccessful operation.
     * @param err
     */
    static Err<E, T = unknown>(err: E) {
        return new Result<T, E>([false, err]);
    }

    private _data: [true, T] | [false, E];
    private constructor(data: Result<T, E>['_data']) {
        this._data = data;
    }

    /**
     * Unwraps a result type, throwing an error with the given message if the result is an Err.
     * @param message
     */
    expect(message: string): T {
        if (this._data[0]) {
            return this._data[1];
        }
        throw new Error(message);
    }

    /**
     * Unwraps a result type, throwing if the result is an Err.
     */
    unwrap(): T {
        return this.expect('Tried to unwrap ok type an error result.');
    }

    /**
     * Unwraps an error type, throwing if the result is Ok.
     */
    unwrapErr(): E {
        if (this._data[0]) {
            throw new Error('Tried to unwrap error type of an ok result.');
        }
        return this._data[1];
    }

    /**
     * Match all possible values of the result.
     * @param funcs
     */
    match<T2, E2>(funcs: { ok(data: T): T2, err(err: E): E2 }): T2 | E2 {
        if (this._data[0]) {
            return funcs.ok(this._data[1]);
        }
        return funcs.err(this._data[1]);
    }

    /**
     * Map the Ok type of a result to a new type.
     * @param func
     */
    map<T2>(func: (data: T) => T2): Result<T2, E> {
        return this.match({
            ok: data => Result.Ok(func(data)),
            err: err => Result.Err(err)
        });
    }

    /**
     * Map the Err type of a result to a new type.
     * @param func
     */
    mapErr<E2>(func: (err: E) => E2): Result<T, E2> {
        return this.match({
            ok: data => Result.Ok(data),
            err: err => Result.Err(func(err))
        });
    }

    toString() {
        return `[${this._data[0] ? 'Ok' : 'Err'} ${this._data[1]}]`;
    }
}

export const Ok = Result.Ok;
export const Err = Result.Err;
