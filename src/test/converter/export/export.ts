export const x = 5;

export function add(x: number, y: number) {
    return x + y;
}

/**
 * This namespace is exported.
 */
declare namespace AmbientNamespace
{
    /**
     * This class is exported.
     */
    class AmbientClass
    {

    }
}
