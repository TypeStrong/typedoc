"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var tsany = ts;
function createCompilerDiagnostic() {
    return tsany.createCompilerDiagnostic.apply(this, arguments);
}
exports.createCompilerDiagnostic = createCompilerDiagnostic;
function compareValues(a, b) {
    return tsany.compareValues.apply(this, arguments);
}
exports.compareValues = compareValues;
function normalizeSlashes(path) {
    return tsany.normalizeSlashes.apply(this, arguments);
}
exports.normalizeSlashes = normalizeSlashes;
function getRootLength(path) {
    return tsany.getRootLength.apply(this, arguments);
}
exports.getRootLength = getRootLength;
function getDirectoryPath() {
    return tsany.getDirectoryPath.apply(this, arguments);
}
exports.getDirectoryPath = getDirectoryPath;
function normalizePath(path) {
    return tsany.normalizePath(path);
}
exports.normalizePath = normalizePath;
function combinePaths(path1, path2) {
    return tsany.combinePaths(path1, path2);
}
exports.combinePaths = combinePaths;
function getSourceFileOfNode(node) {
    return tsany.getSourceFileOfNode.apply(this, arguments);
}
exports.getSourceFileOfNode = getSourceFileOfNode;
function getTextOfNode(node, includeTrivia) {
    if (includeTrivia === void 0) { includeTrivia = false; }
    return tsany.getTextOfNode.apply(this, arguments);
}
exports.getTextOfNode = getTextOfNode;
function declarationNameToString(name) {
    return tsany.declarationNameToString.apply(this, arguments);
}
exports.declarationNameToString = declarationNameToString;
function getJSDocCommentRanges(node, text) {
    return tsany.getJSDocCommentRanges.apply(this, arguments);
}
exports.getJSDocCommentRanges = getJSDocCommentRanges;
function isBindingPattern(node) {
    return tsany.isBindingPattern.apply(this, arguments);
}
exports.isBindingPattern = isBindingPattern;
function getClassExtendsHeritageClauseElement(node) {
    return tsany.getClassExtendsHeritageClauseElement.apply(this, arguments);
}
exports.getClassExtendsHeritageClauseElement = getClassExtendsHeritageClauseElement;
function getClassImplementsHeritageClauseElements(node) {
    return tsany.getClassImplementsHeritageClauseElements.apply(this, arguments);
}
exports.getClassImplementsHeritageClauseElements = getClassImplementsHeritageClauseElements;
function getInterfaceBaseTypeNodes(node) {
    return tsany.getInterfaceBaseTypeNodes.apply(this, arguments);
}
exports.getInterfaceBaseTypeNodes = getInterfaceBaseTypeNodes;
exports.CharacterCodes = tsany.CharacterCodes;
exports.optionDeclarations = tsany.optionDeclarations;
exports.Diagnostics = tsany.Diagnostics;
//# sourceMappingURL=ts-internal.js.map