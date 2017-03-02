import * as Path from 'path';
import * as FS from 'fs';
import * as ts from 'typescript';

import {Reflection} from '../../models/reflections/abstract';
import {Plugin} from './Plugin';
import {Converter} from '../converter';
import {Context} from '../context';

/**
 * A handler that tries to find the package.json and readme.md files of the
 * current project.
 *
 * The handler traverses the file tree upwards for each file processed by the processor
 * and records the nearest package info files it can find. Within the resolve files, the
 * contents of the found files will be read and appended to the ProjectReflection.
 */
export class PackagePlugin extends Plugin {
    /**
     * The file name of the found readme.md file.
     */
    private readmeFile: string;

    /**
     * The file name of the found package.json file.
     */
    private packageFile: string;

    /**
     * List of directories the handler already inspected.
     */
    private visited: string[];

    /**
     * Should the readme file be ignored?
     */
    private noReadmeFile: boolean;

    /**
     * Create a new PackageHandler instance.
     */
    initialize() {
        this.listenTo(this.converter, {
            [Converter.EVENT_BEGIN]:         this.onBegin,
            [Converter.EVENT_FILE_BEGIN]:    this.onBeginDocument,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve
        });
    }

    /**
     * Triggered when the converter begins converting a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBegin(context: Context) {
        this.readmeFile  = null;
        this.packageFile = null;
        this.visited     = [];

        let readme = this.converter.options.readme;
        this.noReadmeFile = (readme === 'none');
        if (!this.noReadmeFile && readme) {
            readme = Path.resolve(readme);
            if (FS.existsSync(readme)) {
                this.readmeFile = readme;
            }
        }
    }

    /**
     * Triggered when the converter begins converting a source file.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently processed.
     * @param node  The node that is currently processed if available.
     */
    private onBeginDocument(context: Context, reflection: Reflection, node?: ts.SourceFile) {
        if (!node) {
            return;
        }
        if (this.readmeFile && this.packageFile) {
            return;
        }

        const fileName = node.fileName;
        let dirName: string, parentDir = Path.resolve(Path.dirname(fileName));
        do {
            dirName = parentDir;
            if (this.visited.indexOf(dirName) !== -1) {
                break;
            }

            FS.readdirSync(dirName).forEach((file) => {
                const lfile = file.toLowerCase();
                if (!this.noReadmeFile && !this.readmeFile && lfile === 'readme.md') {
                    this.readmeFile = Path.join(dirName, file);
                }

                if (!this.packageFile && lfile === 'package.json') {
                    this.packageFile = Path.join(dirName, file);
                }
            });

            this.visited.push(dirName);
            parentDir = Path.resolve(Path.join(dirName, '..'));
        } while (dirName !== parentDir);
    }

    /**
     * Triggered when the converter begins resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBeginResolve(context: Context) {
        const project = context.project;
        if (this.readmeFile) {
            project.readme = FS.readFileSync(this.readmeFile, 'utf-8');
        }

        if (this.packageFile) {
            project.packageInfo = JSON.parse(FS.readFileSync(this.packageFile, 'utf-8'));
            if (!project.name) {
                project.name = project.packageInfo.name;
            }
        }
    }
}
