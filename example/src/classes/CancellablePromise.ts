const noop = () => {
    /* purposefully empty */
};

/**
 * If canceled, a {@link CancellablePromise | `CancellablePromise`} should throw an `Cancellation` object.
 */
class Cancellation extends Error {
    constructor(message = "Promise canceled.") {
        super(message);
    }
}

/**
 * The most abstract thing we can cancel — a thenable with a cancel method.
 */
type PromiseWithCancel<T> = PromiseLike<T> & { cancel(): void };

/**
 * Determines if an arbitrary value is a thenable with a cancel method.
 */
function isPromiseWithCancel<T>(value: unknown): value is PromiseWithCancel<T> {
    return (
        typeof value === "object" &&
        typeof (value as any).then === "function" &&
        typeof (value as any).cancel === "function"
    );
}

/**
 * This example shows off how TypeDoc handles
 *
 * - Complex method signatures
 * - Static methods
 * - A method with 10 overload signatures. Wow!
 *     - Only the implementation signature has a doc comment. TypeDoc
 *       automatically copies the comment from the implementation signature to
 *       each of the visible signatures if they don't have one.
 *
 * A promise with a `cancel` method.  If canceled, the `CancellablePromise` will
 * reject with a `Cancellation` object. Originally from
 * [real-cancellable-promise](https://github.com/srmagura/real-cancellable-promise).
 *
 * @typeParam T what the `CancellablePromise` resolves to
 *
 * @groupDescription Methods
 * Descriptions can be added for groups with `@groupDescription`, which will show up in
 * the index where groups are listed. This works for both manually created groups which
 * are created with `@group`, and implicit groups like the `Methods` group that this
 * description is attached to.
 */
export class CancellablePromise<T> {
    /**
     * As a consumer of the library, you shouldn't ever need to access
     * `CancellablePromise.promise` directly.
     *
     * If you are subclassing `CancellablePromise` for some reason, you
     * can access this property.
     */
    protected readonly promise: Promise<T>;

    // IMPORTANT: When defining a new `cancel` function,
    // e.g. in the implementation of `then`,
    // always use an arrow function so that `this` is bound.

    /**
     * Cancel the `CancellablePromise`.
     */
    readonly cancel: (reason?: string) => void;

    /**
     * @param promise a normal promise or thenable
     * @param cancel a function that cancels `promise`. **Calling `cancel` after
     * `promise` has resolved must be a no-op.**
     */
    constructor(promise: PromiseLike<T>, cancel: (reason?: string) => void) {
        this.promise = Promise.resolve(promise);
        this.cancel = cancel;
    }

    /**
     * Analogous to `Promise.then`.
     *
     * `onFulfilled` on `onRejected` can return a value, a normal promise, or a
     * `CancellablePromise`. So you can make a chain a `CancellablePromise`s
     * like this:
     *
     * ```
     * const overallPromise = cancellableAsyncFunction1()
     *     .then(cancellableAsyncFunction2)
     *     .then(cancellableAsyncFunction3)
     *     .then(cancellableAsyncFunction4)
     * ```
     *
     * Then if you call `overallPromise.cancel`, `cancel` is called on all
     * `CancellablePromise`s in the chain! In practice, this means that
     * whichever async operation is in progress will be canceled.
     *
     * @returns a new CancellablePromise
     */
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?:
            | ((value: T) => TResult1 | PromiseLike<TResult1>)
            | undefined
            | null,
        onRejected?:
            | ((reason: any) => TResult2 | PromiseLike<TResult2>)
            | undefined
            | null,
    ): CancellablePromise<TResult1 | TResult2> {
        let fulfill;
        let reject;
        let callbackPromiseWithCancel: PromiseWithCancel<unknown> | undefined;

        if (onFulfilled) {
            fulfill = (value: T): TResult1 | PromiseLike<TResult1> => {
                const nextValue: TResult1 | PromiseLike<TResult1> =
                    onFulfilled(value);

                if (isPromiseWithCancel(nextValue))
                    callbackPromiseWithCancel = nextValue;

                return nextValue;
            };
        }

        if (onRejected) {
            reject = (reason: any): TResult2 | PromiseLike<TResult2> => {
                const nextValue: TResult2 | PromiseLike<TResult2> =
                    onRejected(reason);

                if (isPromiseWithCancel(nextValue))
                    callbackPromiseWithCancel = nextValue;

                return nextValue;
            };
        }

        const newPromise = this.promise.then(fulfill, reject);

        const newCancel = () => {
            this.cancel();
            callbackPromiseWithCancel?.cancel();
        };

        return new CancellablePromise(newPromise, newCancel);
    }

    /**
     * Analogous to `Promise.catch`.
     */
    catch<TResult = never>(
        onRejected?:
            | ((reason: any) => TResult | PromiseLike<TResult>)
            | undefined
            | null,
    ): CancellablePromise<T | TResult> {
        return this.then(undefined, onRejected);
    }

    /**
     * Attaches a callback that is invoked when the Promise is settled
     * (fulfilled or rejected). The resolved value cannot be modified from the
     * callback.
     * @param onFinally The callback to execute when the Promise is settled
     * (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(
        onFinally?: (() => void) | undefined | null,
    ): CancellablePromise<T> {
        return new CancellablePromise(
            this.promise.finally(onFinally),
            this.cancel,
        );
    }

    /**
     * Analogous to `Promise.resolve`.
     *
     * The returned promise should resolve even if it is canceled. The idea is
     * that the promise is resolved instantaneously, so by the time the promise
     * is canceled, it has already resolved.
     */
    static resolve(): CancellablePromise<void>;

    static resolve<T>(value: T): CancellablePromise<T>;

    static resolve(value?: unknown): CancellablePromise<unknown> {
        return new CancellablePromise(Promise.resolve(value), noop);
    }

    /**
     * Analogous to `Promise.reject`.
     *
     * Like `CancellablePromise.resolve`, canceling the returned
     * `CancellablePromise` is a no-op.
     *
     * @param reason this should probably be an `Error` object
     */
    static reject<T>(reason?: unknown): CancellablePromise<T> {
        return new CancellablePromise(Promise.reject(reason), noop);
    }

    static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
        values: readonly [
            T1 | PromiseLike<T1>,
            T2 | PromiseLike<T2>,
            T3 | PromiseLike<T3>,
            T4 | PromiseLike<T4>,
            T5 | PromiseLike<T5>,
            T6 | PromiseLike<T6>,
            T7 | PromiseLike<T7>,
            T8 | PromiseLike<T8>,
            T9 | PromiseLike<T9>,
            T10 | PromiseLike<T10>,
        ],
    ): CancellablePromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;

    static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
        values: readonly [
            T1 | PromiseLike<T1>,
            T2 | PromiseLike<T2>,
            T3 | PromiseLike<T3>,
            T4 | PromiseLike<T4>,
            T5 | PromiseLike<T5>,
            T6 | PromiseLike<T6>,
            T7 | PromiseLike<T7>,
            T8 | PromiseLike<T8>,
            T9 | PromiseLike<T9>,
        ],
    ): CancellablePromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;

    static all<T1, T2, T3, T4, T5, T6, T7, T8>(
        values: readonly [
            T1 | PromiseLike<T1>,
            T2 | PromiseLike<T2>,
            T3 | PromiseLike<T3>,
            T4 | PromiseLike<T4>,
            T5 | PromiseLike<T5>,
            T6 | PromiseLike<T6>,
            T7 | PromiseLike<T7>,
            T8 | PromiseLike<T8>,
        ],
    ): CancellablePromise<[T1, T2, T3, T4, T5, T6, T7, T8]>;

    static all<T1, T2, T3, T4, T5, T6, T7>(
        values: readonly [
            T1 | PromiseLike<T1>,
            T2 | PromiseLike<T2>,
            T3 | PromiseLike<T3>,
            T4 | PromiseLike<T4>,
            T5 | PromiseLike<T5>,
            T6 | PromiseLike<T6>,
            T7 | PromiseLike<T7>,
        ],
    ): CancellablePromise<[T1, T2, T3, T4, T5, T6, T7]>;

    static all<T1, T2, T3, T4, T5, T6>(
        values: readonly [
            T1 | PromiseLike<T1>,
            T2 | PromiseLike<T2>,
            T3 | PromiseLike<T3>,
            T4 | PromiseLike<T4>,
            T5 | PromiseLike<T5>,
            T6 | PromiseLike<T6>,
        ],
    ): CancellablePromise<[T1, T2, T3, T4, T5, T6]>;

    static all<T1, T2, T3, T4, T5>(
        values: readonly [
            T1 | PromiseLike<T1>,
            T2 | PromiseLike<T2>,
            T3 | PromiseLike<T3>,
            T4 | PromiseLike<T4>,
            T5 | PromiseLike<T5>,
        ],
    ): CancellablePromise<[T1, T2, T3, T4, T5]>;

    static all<T1, T2, T3, T4>(
        values: readonly [
            T1 | PromiseLike<T1>,
            T2 | PromiseLike<T2>,
            T3 | PromiseLike<T3>,
            T4 | PromiseLike<T4>,
        ],
    ): CancellablePromise<[T1, T2, T3, T4]>;

    static all<T1, T2, T3>(
        values: readonly [
            T1 | PromiseLike<T1>,
            T2 | PromiseLike<T2>,
            T3 | PromiseLike<T3>,
        ],
    ): CancellablePromise<[T1, T2, T3]>;

    static all<T1, T2>(
        values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>],
    ): CancellablePromise<[T1, T2]>;

    static all<T>(
        values: readonly (T | PromiseLike<T>)[],
    ): CancellablePromise<T[]>;

    /**
     * Analogous to `Promise.all`.
     *
     * @param values an array that may contain `CancellablePromise`s, promises,
     * thenables, and resolved values
     * @returns a {@link CancellablePromise | `CancellablePromise`}, which, if canceled, will cancel each
     * of the promises passed in to `CancellablePromise.all`.
     */
    static all(values: readonly unknown[]): CancellablePromise<unknown> {
        return new CancellablePromise(Promise.all(values), () => {
            for (const value of values) {
                if (isPromiseWithCancel(value)) value.cancel();
            }
        });
    }

    /**
     * Creates a `CancellablePromise` that is resolved with an array of results
     * when all of the provided `Promises` resolve or reject.
     * @param values An array of `Promises`.
     * @returns A new `CancellablePromise`.
     */
    static allSettled<T extends readonly unknown[] | readonly [unknown]>(
        values: T,
    ): CancellablePromise<{
        -readonly [P in keyof T]: PromiseSettledResult<
            T[P] extends PromiseLike<infer U> ? U : T[P]
        >;
    }>;

    /**
     * Creates a `CancellablePromise` that is resolved with an array of results
     * when all of the provided `Promise`s resolve or reject.
     *
     * @param values An array of `Promise`s.
     * @returns A new `CancellablePromise`. Canceling it cancels all of the input
     * promises.
     */
    static allSettled<T>(
        values: Iterable<T>,
    ): CancellablePromise<
        PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>[]
    >;

    static allSettled(values: unknown[]): CancellablePromise<unknown> {
        const cancel = (): void => {
            for (const value of values) {
                if (isPromiseWithCancel(value)) {
                    value.cancel();
                }
            }
        };

        return new CancellablePromise(Promise.allSettled(values), cancel);
    }

    /**
     * Creates a `CancellablePromise` that is resolved or rejected when any of
     * the provided `Promises` are resolved or rejected.
     * @param values An array of `Promises`.
     * @returns A new `CancellablePromise`. Canceling it cancels all of the input
     * promises.
     */
    static race<T>(values: readonly T[]): CancellablePromise<Awaited<T>> {
        const cancel = (): void => {
            for (const value of values) {
                if (isPromiseWithCancel(value)) {
                    value.cancel();
                }
            }
        };

        return new CancellablePromise(Promise.race(values), cancel);
    }

    /**
     * @returns a `CancellablePromise` that resolves after `ms` milliseconds.
     */
    static delay(ms: number): CancellablePromise<void> {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let rejectFn: (reason?: any) => void = noop;

        const promise = new Promise<void>((resolve, reject) => {
            timer = setTimeout(() => {
                resolve();
                rejectFn = noop;
            }, ms);
            rejectFn = reject;
        });

        return new CancellablePromise(promise, () => {
            if (timer) clearTimeout(timer);
            rejectFn(new Cancellation());
        });
    }
}
