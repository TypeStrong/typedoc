import { deepStrictEqual as equal } from "assert";
import { Slugger } from "../../lib/output/index.js";

describe("Slugger", () => {
    it("Is case sensitive #2012", () => {
        const slugger = new Slugger({ lowercase: true });
        equal(slugger.slug("model"), "model");
        equal(slugger.slug("Model"), "model-1");
    });

    it("Is case sensitive even when lowercasing output is disabled", () => {
        const slugger = new Slugger({ lowercase: false });
        equal(slugger.slug("model"), "model");
        equal(slugger.slug("Model"), "Model-1");
    });
});
