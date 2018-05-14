import * as Path from 'path';
import * as FS from 'fs';
import * as markdownLinkExtractor from 'markdown-link-extractor';
import * as escapeStringRegexp from 'escape-string-regexp';

import Readme from './readme';

/**
 * Container for a readme linked collection.
 */
export default class ReadmePackage {

    /**
     * All the readme file definitions.
     */
    protected definitions: Readme[];

    /**
     * Creates a readme package.
     *
     * @param {Readme[]} definitions
     *   The readme file definitions.
     */
    private constructor(definitions: Readme[]) {
        this.definitions = definitions;
    }

    /**
     * Create readme package from base file.
     *
     * @param {string} readmePath
     *   The base readme path.
     *
     * @returns {ReadmePackage}
     */
    public static createFromBase(readmePath: string) {
        let mdPages: Readme[] = [];
        this.loadDefinitions(mdPages, Path.dirname(readmePath), Path.basename(readmePath));

        return new this(mdPages);
    }

    /**
     * Loads all linked readme file definitions from base readme.
     *
     * @param {Readme[]} pages
     * @param {string} currentDirectory
     * @param {string} fileName
     * @param {boolean} isRoot
     */
    protected static loadDefinitions(pages: Readme[], currentDirectory: string, fileName: string, basePath: string = '', isRoot: boolean = true) {
        const fullPath = Path.join(currentDirectory, fileName);
        const readmeContents: string = FS.readFileSync(fullPath, 'utf-8');

        // Get MD file links.
        const mdFiles = markdownLinkExtractor(readmeContents).filter((link: string) => {
            return !link.match(/^(ftp|https?):\/\/.*/) &&
                link.match(/.*\.(?:md|MD|mD|Md)$/);
        });

        pages.push(new Readme(readmeContents, Path.join(basePath, fileName), isRoot));

        // Gather MD file contents
        mdFiles.forEach((filePath: string) => {
            const fileFullPath = Path.join(currentDirectory, filePath);
            const normalizedPath = Path.normalize(filePath);
            const normalizedBasePath = Path.join(basePath, filePath);
            const newBasePath = Path.join(basePath, Path.dirname(filePath));

            if (!FS.existsSync(fileFullPath)) {
                return;
            }

            if (normalizedPath === Path.normalize(fileName)) {
                return;
            }

            // Parse only if we did not yet to prevent infinite loop.
            if (!pages.find((readme) => readme.path === normalizedBasePath)) {
                this.loadDefinitions(
                    pages,
                    Path.dirname(fileFullPath),
                    Path.basename(fileFullPath),
                    newBasePath,
                    false
                );
            }
        });
    }

    /**
     * Updates path of a given readme file.
     *
     * @param {Readme} readme
     * @param {string} newPath
     */
    public updatePath(readme: Readme, newPath: string) {
        if (!this.definitions.find((r) => readme === r)) {
            return;
        }

        this.definitions.forEach((otherReadme) => {
            const relativePath = Path.join(Path.relative(Path.dirname(otherReadme.path), Path.dirname(readme.path)), Path.basename(readme.path));

            const matchUrl = '(?:./)?' + escapeStringRegexp(relativePath) + '(?:#[^\\)\\>]*)?';
            const matchLinks = new RegExp(` {0,3}\\[(?:\\\\[\\[\\]]|[^\\[\\]])+\\]:?` +
                ` *\\n? *<?(?:${matchUrl})?>?(?:(?: *\\n? *| *\\n *)((?:"(?:\\\\"|[^"]|"[^"\\n]*")*"|'\\n?` +
                `(?:[^'\\n]+\\n?)*'|\\(${matchUrl}\\))))`, 'g');

            let content = otherReadme.content;
            const matches = content.match(matchLinks);

            if (!matches) {
                return;
            }

            const newRelativePath = Path.join(Path.relative(Path.dirname(otherReadme.path), Path.dirname(newPath)), Path.basename(newPath));

            // Array unique.
            Array.from(new Set(matches)).forEach((match) => {
                let replacement = match.replace(relativePath, newRelativePath);
                content = content.replace(match, replacement);
            });

            otherReadme.content = content;
        });

        readme.path = newPath;
    }

    /**
     * Updates paths of readme files.
     *
     * @param {Function} callback
     */
    public updatePaths(callback: Function) {
        this.definitions.forEach((readme) =>
            this.updatePath(readme, callback(readme)));
    }

    /**
     * Gets the root readme file.
     *
     * @returns {Readme}
     */
    public getRoot(): Readme {
        return this.definitions.find((readme) => readme.isRoot);
    }

    /**
     * Gets all readme definitions.
     *
     * @returns {Readme[]}
     */
    public getDefinitions() {
        return this.definitions;
    }

}
