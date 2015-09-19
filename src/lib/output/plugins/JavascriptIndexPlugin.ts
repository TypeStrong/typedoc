import * as Path from "path";

import {DeclarationReflection, ProjectReflection} from "../../models/reflections/index";
import {GroupPlugin} from "../../converter/plugins/GroupPlugin";
import {Component, RendererComponent} from "../components";
import {writeFile} from "../../utils/fs";
import {RendererEvent} from "../events";


/**
 * A plugin that exports an index of the project to a javascript file.
 *
 * The resulting javascript file can be used to build a simple search function.
 */
@Component({name:"javascript-index"})
export class JavascriptIndexPlugin extends RendererComponent
{
    /**
     * Create a new JavascriptIndexPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, RendererEvent.BEGIN, this.onRendererBegin);
    }


    /**
     * Triggered after a document has been rendered, just before it is written to disc.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRendererBegin(event:RendererEvent) {
        var rows:any[] = [];
        var kinds = {};

        for (var key in event.project.reflections) {
            var reflection:DeclarationReflection = <DeclarationReflection>event.project.reflections[key];
            if (!(reflection instanceof DeclarationReflection)) continue;

            if (!reflection.url ||
                !reflection.name ||
                reflection.flags.isExternal ||
                reflection.name == '')
                continue;

            var parent = reflection.parent;
            if (parent instanceof ProjectReflection) {
                parent = null;
            }

            var row:any = {
                id: rows.length,
                kind:    reflection.kind,
                name:    reflection.name,
                url:     reflection.url,
                classes: reflection.cssClasses
            };

            if (parent) {
                row.parent = parent.getFullName();
            }

            if (!kinds[reflection.kind]) {
                kinds[reflection.kind] = GroupPlugin.getKindSingular(reflection.kind);
            }

            rows.push(row);
        }

        var fileName = Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
        var data =
            'var typedoc = typedoc || {};' +
            'typedoc.search = typedoc.search || {};' +
            'typedoc.search.data = ' + JSON.stringify({kinds:kinds, rows:rows}) + ';';

        writeFile(fileName, data, true);
    }
}
