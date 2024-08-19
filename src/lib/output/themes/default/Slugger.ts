/**
 * Responsible for getting a unique anchor for elements within a page.
 */
export class Slugger {
    private seen = new Map<string, number>();

    private serialize(value: string) {
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

    slug(value: string) {
        const originalSlug = this.serialize(value);
        let slug = originalSlug;
        let count = 0;
        if (this.seen.has(slug)) {
            count = this.seen.get(originalSlug)!;
            do {
                count++;
                slug = `${originalSlug}-${count}`;
            } while (this.seen.has(slug));
        }
        this.seen.set(originalSlug, count);
        this.seen.set(slug, 0);
        return slug;
    }
}
