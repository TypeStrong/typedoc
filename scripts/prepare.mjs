// @ts-check
// See https://github.com/cspotcode/workaround-broken-npm-prepack-behavior

import { spawnSync } from "child_process";
import { isAbsolute, normalize, relative } from "path";

const {
    npm_config_local_prefix,
    npm_config_cache,
    npm_package_resolved,
    npm_package_json,
    npm_node_execpath,
    npm_execpath,
} = process.env;

if (!npm_node_execpath || !npm_execpath) {
    process.exit(0);
}

function isInstallingAsGitDepInNpm() {
    if (!npm_config_cache) return false;
    const normalizedNpmConfigCache = normalize(npm_config_cache);

    // Check if any of these paths are within npm's cache directory
    for (const path of [
        npm_package_json,
        npm_package_resolved,
        npm_config_local_prefix,
    ]) {
        if (!path) continue;
        // If local prefix is subdirectory of cache, assume we're being installed as
        // a git dep
        const normalized = normalize(path);
        const rel = relative(normalizedNpmConfigCache, normalized);
        if (!isAbsolute(rel) && !rel.startsWith("..")) return true;
    }
}

if (isInstallingAsGitDepInNpm()) {
    spawnSync(npm_node_execpath, [npm_execpath, "run", "prepack"], {
        stdio: "inherit",
    });
}
