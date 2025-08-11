/**
 * {@link x} <-- should be resolved with TS resolution
 * @packageDocumentation
 */

/** Required comment */
import { x } from "gh2994";

export var y: 2;

declare module "gh2994" {
    var x: 1;
}
