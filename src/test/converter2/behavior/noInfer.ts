export function createStreetLight<C extends string>(
    colors: C[],
    defaultColor?: NoInfer<C>,
) {}

// @ts-expect-error
createStreetLight(["red", "yellow", "green"], "blue");
