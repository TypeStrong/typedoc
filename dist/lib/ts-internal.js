"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const tsany = ts;
function createCompilerDiagnostic() {
    return tsany.createCompilerDiagnostic.apply(this, arguments);
}
exports.createCompilerDiagnostic = createCompilerDiagnostic;
exports.optionDeclarations = tsany.optionDeclarations;
//# sourceMappingURL=ts-internal.js.map