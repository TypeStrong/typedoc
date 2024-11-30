export type TypeNodeType = {
    // @ts-expect-error
    generated: import("@typedoc/dummy").GeneratedType;
};

// @ts-expect-error
export const typeType = null! as import("@typedoc/dummy").GeneratedType;
