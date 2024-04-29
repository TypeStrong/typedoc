type OptionalKeys<T> = {
    [K in keyof T]: T[K] extends { $opt: any } ? K : never;
}[keyof T];

type FromSchema<T> = T extends typeof String
    ? string
    : T extends readonly [typeof Array, infer U]
      ? FromSchema<U>[]
      : {
            [K in OptionalKeys<T>]?: FromSchema<
                (T[K] & { $opt: unknown })["$opt"]
            >;
        } & {
            [K in Exclude<keyof T, OptionalKeys<T>>]: FromSchema<T[K]>;
        };

export const schema = {
    x: [
        Array,
        {
            z: String,
            y: { $opt: String },
        },
    ],
} as const;

export type Schema = FromSchema<typeof schema>;

export const schemaTypeBased = null! as Schema;

export type ExpressionSpecification =
    | ["array", unknown | ExpressionSpecification]
    | [
          "array",
          string | ExpressionSpecification,
          unknown | ExpressionSpecification,
      ];

export class Map {
    getFilter(layerId: string): ExpressionSpecification | void {
        return;
    }
}
