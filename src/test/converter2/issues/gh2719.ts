export const allTimezoneNames = ["Africa/Abidjan", "Africa/Accra"] as const;

export type ArrayElement<ArrayType extends ReadonlyArray<any>> =
    ArrayType[number];

export type Timezone = ArrayElement<typeof allTimezoneNames>;

/**
 * @enum
 */
export const Timezone = allTimezoneNames.reduce(
    (acc, timezoneName) => {
        acc[timezoneName] = timezoneName;
        return acc;
    },
    {} as Record<string, string>,
) as Readonly<{
    [SpecificTimezoneName in Timezone]: SpecificTimezoneName;
}>;
