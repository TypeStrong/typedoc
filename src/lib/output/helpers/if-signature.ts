import { SignatureReflection } from "../../models/reflections/signature";

export function ifSignature(this: any, obj: any, arg: any) {
    if (obj instanceof SignatureReflection) {
        return arg.fn(this);
    } else {
        return arg.inverse(this);
    }
}
