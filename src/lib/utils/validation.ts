export type Infer<T extends Schema> = T extends Optional<infer U>
    ? Infer<U>
    : T extends Guard<infer U>
    ? U
    : T extends typeof String
    ? string
    : T extends typeof Number
    ? number
    : T extends typeof Boolean
    ? boolean
    : T extends readonly string[]
    ? T[number]
    : T extends readonly [typeof Array, Schema]
    ? Array<Infer<T[1]>>
    : {
          -readonly [K in OptionalKeys<T>]?: Infer<
              Extract<T[K & keyof T], Schema>
          >;
      } & {
          -readonly [K in Exclude<keyof T, OptionalKeys<T>>]: Infer<
              Extract<T[K], Schema>
          >;
      };

export type Optional<T extends Schema> = Record<typeof opt, T>;
export type Guard<T> = (x: unknown) => x is T;

type OptionalKeys<T> = keyof {
    [K in keyof T as T[K] extends Optional<any> ? K : never]: 1;
};

const opt = Symbol();

export type Schema =
    | typeof String
    | typeof Number
    | typeof Boolean
    | readonly string[]
    | readonly [typeof Array, Schema]
    | { readonly [k: string]: Schema }
    | Guard<unknown>
    | Optional<typeof String>
    | Optional<typeof Number>
    | Optional<typeof Boolean>
    | Optional<readonly string[]>
    | Optional<readonly [typeof Array, Schema]>
    | Optional<{ readonly [k: string]: Schema }>
    | Optional<Guard<unknown>>;

/**
 * Straightforward, fairly dumb, validation helper.
 * @param schema
 * @param obj
 */
export function validate<T extends Schema>(
    schema: T,
    obj: unknown
): obj is Infer<T>;
export function validate(schema: Schema, obj: any): boolean {
    let type: any = schema;
    if (opt in schema) {
        if (obj == null) {
            return true;
        }
        type = (schema as Optional<Schema>)[opt];
    }

    if (type === String) {
        return typeof obj === "string";
    }

    if (type === Number) {
        return typeof obj === "number";
    }

    if (type === Boolean) {
        return typeof obj === "boolean";
    }

    if (typeof type === "function") {
        return type(obj);
    }

    if (Array.isArray(type)) {
        if (type[0] === Array) {
            return (
                Array.isArray(obj) &&
                obj.every((item) => validate(type[1], item))
            );
        }

        return type.includes(obj);
    }

    return (
        !!obj &&
        typeof obj === "object" &&
        !Array.isArray(obj) &&
        Object.entries<Schema>(type).every(([key, prop]) =>
            validate(prop, obj[key])
        )
    );
}

export function optional<T extends Schema>(x: T): Optional<T> {
    return { [opt]: x };
}

export function isTagString(x: unknown): x is `@${string}` {
    return typeof x === "string" && /^@[a-zA-Z][a-zA-Z0-9]*$/.test(x);
}
