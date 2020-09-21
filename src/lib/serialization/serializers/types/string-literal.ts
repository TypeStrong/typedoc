import { StringLiteralType } from "../../../models";

import { TypeSerializerComponent } from "../../components";
import { StringLiteralType as JSONStringLiteralType } from "../../schema";

export class StringLiteralTypeSerializer extends TypeSerializerComponent<
    StringLiteralType
> {
    supports(t: unknown) {
        return t instanceof StringLiteralType;
    }

    toObject(
        type: StringLiteralType,
        obj: Pick<JSONStringLiteralType, "type">
    ): JSONStringLiteralType {
        return {
            ...obj,
            value: type.value,
        };
    }
}
