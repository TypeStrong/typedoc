import { LiteralType } from "../../../models";

import { TypeSerializerComponent } from "../../components";
import { LiteralType as JSONLiteralType } from "../../schema";

export class LiteralTypeSerializer extends TypeSerializerComponent<
    LiteralType
> {
    supports(t: unknown) {
        return t instanceof LiteralType;
    }

    toObject(
        type: LiteralType,
        obj: Pick<JSONLiteralType, "type">
    ): JSONLiteralType {
        return {
            ...obj,
            value: type.value,
        };
    }
}
