import { getSimilarValues } from "../../../utils/general.js";
import type { TypeDocOptionMap } from "../../../utils/index.js";

/**
 * Responsible for getting a unique anchor for elements within a page.
 */
export class Slugger {
    private seen = new Map<string, number>();

    private serialize(value: string) {
        // Notes:
        // There are quite a few trade-offs here.

        return (
            value
                .trim()
                // remove html tags
                .replace(/<[!/a-z].*?>/gi, "")
                // remove unwanted chars
                .replace(
                    /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
                    "",
                )
                .replace(/\s/g, "-")
        );
    }

    constructor(private options: TypeDocOptionMap["sluggerConfiguration"]) {}

    slug(value: string) {
        const originalSlug = this.serialize(value);
        const lowerOriginalSlug = originalSlug.toLocaleLowerCase();
        let count = 0;
        let slug = lowerOriginalSlug;
        if (this.seen.has(lowerOriginalSlug)) {
            count = this.seen.get(lowerOriginalSlug)!;
            do {
                count++;
                slug = `${lowerOriginalSlug}-${count}`;
            } while (this.seen.has(slug));
        }
        this.seen.set(lowerOriginalSlug, count);
        if (!this.options.lowercase) {
            return count === 0 ? originalSlug : `${originalSlug}-${count}`;
        }
        return slug;
    }

    hasAnchor(anchor: string) {
        return this.seen.has(anchor);
    }

    getSimilarAnchors(anchor: string) {
        return getSimilarValues(this.seen.keys(), anchor);
    }
}
