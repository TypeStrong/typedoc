import { getSimilarValues } from "#utils";
import type { TypeDocOptionMap } from "#node-utils";

/**
 * Responsible for getting a unique anchor for elements within a page.
 */
export class Slugger {
    private seen = new Map<string, number>();

    private serialize(value: string) {
        // There are quite a few trade-offs here. We used to remove HTML tags here,
        // but TypeDoc now removes the HTML tags before passing text into the slug
        // method, which allows us to skip doing that here. This improves the slugger
        // generation for headers which look like the following:
        // (html allowed in markdown)
        // # test &lt;t&gt;
        // (html disallowed in markdown)
        // # test <t>
        // both of the above should slug to test-t

        return (
            value
                .trim()
                // remove unwanted chars
                .replace(
                    /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
                    "",
                )
                // change whitespace to dash
                .replace(/\s/g, "-")
                // combine adjacent dashes
                .replace(/--+/, "-")
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
