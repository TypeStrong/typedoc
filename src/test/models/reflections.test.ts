import { ok } from "assert";
import { FileRegistry, ProjectReflection } from "../../lib/models";

describe("ProjectReflection", () => {
    it("getReflectionById works with the project ID", () => {
        const project = new ProjectReflection("", new FileRegistry());
        ok(project === project.getReflectionById(project.id));
    });
});
