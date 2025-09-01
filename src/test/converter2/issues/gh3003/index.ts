import { CustomEnum } from "./enums.js";

/**
 * This is a second custom enum that is exported as a constant object.
 *
 * @enum
 */
const CustomEnum2 = {
    ...CustomEnum,
    D: "D",
} as const;

/** @namespace */
export const ExportedObject = {
    CustomEnum,
    CustomEnum2,
};
