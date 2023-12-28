import type { Deserializer } from "../../serialization/deserializer";
import type { SourceReference as JSONSourceReference } from "../../serialization/schema";

/**
 * Represents references of reflections to their defining source files.
 *
 * @see {@link DeclarationReflection.sources}
 */
export class SourceReference {
    /**
     * The filename of the source file.
     */
    fileName: string;

    /**
     * The absolute filename of the source file.
     * @internal
     */
    fullFileName: string;

    /**
     * The one based number of the line that emitted the declaration.
     */
    line: number;

    /**
     * The index of the character that emitted the declaration.
     */
    character: number;

    /**
     * URL for displaying the source file.
     */
    url?: string;

    constructor(fileName: string, line: number, character: number) {
        this.fileName = fileName;
        this.fullFileName = fileName;
        this.line = line;
        this.character = character;
    }

    equals(other: SourceReference) {
        return (
            this.fullFileName == other.fullFileName &&
            this.line === other.line &&
            this.character === other.character
        );
    }

    toObject(): JSONSourceReference {
        return {
            fileName: this.fileName,
            line: this.line,
            character: this.character,
            url: this.url,
        };
    }

    fromObject(_de: Deserializer, obj: JSONSourceReference) {
        this.url = obj.url;
    }
}
