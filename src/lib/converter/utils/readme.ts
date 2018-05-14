/**
 * Readme model.
 */
export default class Readme {

    /**
     * The path / URL of the readme.
     */
    private _path: string;

    /**
     * The content of the readme.
     */
    private _content: string;

    /**
     * Whether it's the primary / index readme.
     */
    readonly _isRoot: boolean;

    /**
     * Creates a readme.
     *
     * @param {string} content
     * @param {string} path
     * @param {boolean} isRoot
     */
    constructor(content: string, path: string, isRoot: boolean = false) {
        this._path = path;
        this._content = content;
        this._isRoot = isRoot;
    }

    get path(): string {
        return this._path;
    }

    set path(value: string) {
        this._path = value;
    }

    get content(): string {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

    get isRoot(): boolean {
        return this._isRoot;
    }
}
