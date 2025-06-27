/**
 * {@link Map.size} TS resolves link, not included in docs #2700 #2967
 * {@link DoesNotExist} Symbol does not exist #2681
 * {@link @typedoc/foo.DoesNotExist} Symbol does not exist, looks like an attempt to link to a package directly #2360
 */
export const abc = new Map<string, number>();
