/**
 * @inline
 */
type TestReturn =
    /**
     * An apple a day keeps the doctor away.
     */
    | { kind: 'apple', isHealthy: true }
    /**
     * A donut a day keeps the doctor not away.
     */
    | { kind: 'sweets', isHealthy: false }

/**
 * Returns a random value
 */
export function test(): TestReturn {
    return Math.random() > 0.5
        ? { kind: 'apple', isHealthy: true }
        : { kind: 'sweets', isHealthy: false };
}