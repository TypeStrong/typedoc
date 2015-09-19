import {Component, RendererComponent} from "../components";
import {PageEvent} from "../events";


/**
 * List of states the parser of [[PrettyPrintPlugin]] can be in.
 */
enum PrettyPrintState {
    /**
     * Default state of the parser. Empty lines will be removed and indention will be adjusted.
     */
    Default,

    /**
     * Comment state, the parser waits for a comment closing tag.
     */
    Comment,

    /**
     * Pre state, the parser waits for the closing tag of the current pre block.
     */
    Pre
}


/**
 * A plugin that pretty prints the generated html.
 *
 * This not only aids in making the generated html source code more readable, by removing
 * blank lines and unnecessary whitespaces the size of the documentation is reduced without
 * visual impact.
 *
 * At the point writing this the docs of TypeDoc took 97.8 MB  without and 66.4 MB with this
 * plugin enabled, so it reduced the size to 68% of the original output.
 */
@Component({name:"pretty-print"})
export class PrettyPrintPlugin extends RendererComponent
{
    /**
     * Map of all tags that will be ignored.
     */
    static IGNORED_TAGS:any = {
        area:    true,
        base:    true,
        br:      true,
        wbr:     true,
        col:     true,
        command: true,
        embed:   true,
        hr:      true,
        img:     true,
        input:   true,
        link:    true,
        meta:    true,
        param:   true,
        source:  true
    };

    /**
     * Map of all tags that prevent this plugin form modifying the following code.
     */
    static PRE_TAGS:any = {
        pre:      true,
        code:     true,
        textarea: true,
        script:   true,
        style:    true
    };


    /**
     * Create a new PrettyPrintPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, PageEvent.END, this.onRendererEndPage, -1024);
    }


    /**
     * Triggered after a document has been rendered, just before it is written to disc.
     *
     * @param event
     */
    onRendererEndPage(event:PageEvent) {
        var match:RegExpMatchArray;
        var line:string;
        var lineState:PrettyPrintState;
        var lineDepth:number;
        var tagName:string;
        var preName:string;

        var tagExp       = /<\s*(\w+)[^>]*>|<\/\s*(\w+)[^>]*>|<!--|-->/g;
        var emptyLineExp = /^[\s]*$/;
        var minLineDepth = 1;
        var state        = PrettyPrintState.Default;
        var stack:string[] = [];

        var lines        = event.contents.split(/\r\n?|\n/);
        var index        = 0;
        var count        = lines.length;

        while (index < count) {
            line = lines[index];
            if (emptyLineExp.test(line)) {
                if (state == PrettyPrintState.Default) {
                    lines.splice(index, 1);
                    count -= 1;
                    continue;
                }
            } else {
                lineState = state;
                lineDepth = stack.length;

                while (match = tagExp.exec(line)) {
                    if (state == PrettyPrintState.Comment) {
                        if (match[0] == '-->') {
                            state = PrettyPrintState.Default;
                        }
                    } else if (state == PrettyPrintState.Pre) {
                        if (match[2] && match[2].toLowerCase() == preName) {
                            state = PrettyPrintState.Default;
                        }
                    } else {
                        if (match[0] == '<!--') {
                            state = PrettyPrintState.Comment;
                        } else if (match[1]) {
                            tagName = match[1].toLowerCase();
                            if (tagName in PrettyPrintPlugin.IGNORED_TAGS) continue;
                            if (tagName in PrettyPrintPlugin.PRE_TAGS) {
                                state = PrettyPrintState.Pre;
                                preName = tagName;
                            } else {
                                if (tagName == 'body') minLineDepth = 2;
                                stack.push(tagName);
                            }
                        } else if (match[2]) {
                            tagName = match[2].toLowerCase();
                            if (tagName in PrettyPrintPlugin.IGNORED_TAGS) continue;

                            var n = stack.lastIndexOf(tagName);
                            if (n != -1) {
                                stack.length = n;
                            }
                        }
                    }
                }

                if (lineState == PrettyPrintState.Default) {
                    lineDepth = Math.min(lineDepth, stack.length);
                    line = line.replace(/^\s+/, '').replace(/\s+$/, '');
                    if (lineDepth > minLineDepth) {
                        line = Array(lineDepth - minLineDepth + 1).join('\t') + line;
                    }

                    lines[index] = line;
                }
            }

            index++;
        }

        event.contents = lines.join('\n');
    }
}
