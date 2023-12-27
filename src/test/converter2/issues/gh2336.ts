export class ClassVersion {
    /**
     * Outer
     * @returns Returns Outer
     */
    outer(): () => void {
        /**
         * Inner
         * @returns Returns Inner
         */
        return () => {};
    }
}
