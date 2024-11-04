/**
 * @param props - Component properties.
 * @param props.title - Title.
 * @param props.options - Options.
 * @param props.options.featureA - Turn on or off featureA.
 * @param props.options.featureB - Turn on or off featureB.
 */
export function ComponentWithOptions({
    title,
    options,
}: {
    title: string;
    options: { featureA: boolean; featureB: boolean };
}) {}
