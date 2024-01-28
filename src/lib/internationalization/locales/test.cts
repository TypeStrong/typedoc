// This should go away once we have a second language in TypeDoc to use
// in unit tests. It's here for now so that we have *something* to test with.
import { buildIncompleteTranslation } from "../translatable";

export = buildIncompleteTranslation({
    no_entry_points_to_merge: "no_entry_points_to_merge",
    docs_generated_at_0: "docs_generated_at_0 {0}",
});
