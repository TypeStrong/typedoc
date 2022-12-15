export function capitalize<T extends string>(string: T) {
    return (
        string === "" ? "" : string[0].toUpperCase() + string.slice(1)
    ) as Capitalize<T>;
}
