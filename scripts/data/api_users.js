// @ts-check

// A list of projects on GitHub which are not published TypeDoc plugins which are
// known to use TypeDoc's JS API. Feel free to add your repo here! This list is
// occasionally used to review known users for potentially breaking changes to
// better gauge impact.

/**
 * @typedef {object} ApiUser
 * @property {string} repo the GitHub repository to check out
 * @property {string} branch the branch to check out
 * @property {string[] | string} filter files/directories containing TypeDoc API usage
 * @property {string} [pkg] location of package.json containing TypeDoc dependency if not at the repo root
 */

// cspell:disable

/** @type {ApiUser[]} */
export const API_USERS = [
    {
        repo: "playcanvas/engine",
        branch: "main",
        filter: "utils/typedoc/typedoc-plugin.mjs",
    },
    {
        repo: "clerk/javascript",
        branch: "main",
        filter: ".typedoc",
    },
];

// Users are moved to this list periodically when they are a minor version behind
// and might be dropped off the list of repos checked for breaking changes eventually
/** @type {ApiUser[]} */
export const OLD_API_USERS = [
    {
        repo: "Fevol/obsidian-typings",
        branch: "main",
        pkg: "docs/package.json",
        filter: "docs/typedoc-plugins/alter-frontmatter-plugin.js",
    },
    {
        repo: "akaday/probot",
        branch: "fb37787c230d4599ff11644e5a3ee7a2120ea5e8",
        filter: ".typedoc/typedoc_ga.mjs",
    },
    {
        repo: "cbunt/react-distortion",
        branch: "main",
        filter: ".config/typedoc-minimal-theme.js",
    },
    {
        repo: "gohypergiant/standard-toolkit",
        branch: "main",
        pkg: "apps/docs/package.json",
        filter: "apps/docs/lib/",
    },
    {
        repo: "vltpkg/vltpkg",
        branch: "main",
        pkg: "www/docs/package.json",
        filter: "www/docs/typedoc",
    },
    {
        repo: "pixiv/three-vrm",
        branch: "dev",
        filter: "typedoc-redirect-legacy-docs-plugin.mjs",
    },
];

export const ALL_API_USERS = [...API_USERS, ...OLD_API_USERS];
