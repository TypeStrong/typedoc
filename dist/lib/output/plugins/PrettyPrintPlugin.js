"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var components_1 = require("../components");
var events_1 = require("../events");
var PrettyPrintState;
(function (PrettyPrintState) {
    PrettyPrintState[PrettyPrintState["Default"] = 0] = "Default";
    PrettyPrintState[PrettyPrintState["Comment"] = 1] = "Comment";
    PrettyPrintState[PrettyPrintState["Pre"] = 2] = "Pre";
})(PrettyPrintState || (PrettyPrintState = {}));
var PrettyPrintPlugin = (function (_super) {
    __extends(PrettyPrintPlugin, _super);
    function PrettyPrintPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrettyPrintPlugin_1 = PrettyPrintPlugin;
    PrettyPrintPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, events_1.PageEvent.END, this.onRendererEndPage, -1024);
    };
    PrettyPrintPlugin.prototype.onRendererEndPage = function (event) {
        var match;
        var line;
        var lineState;
        var lineDepth;
        var tagName;
        var preName;
        var tagExp = /<\s*(\w+)[^>]*>|<\/\s*(\w+)[^>]*>|<!--|-->/g;
        var emptyLineExp = /^[\s]*$/;
        var minLineDepth = 1;
        var state = PrettyPrintState.Default;
        var stack = [];
        var lines = event.contents.split(/\r\n?|\n/);
        var index = 0;
        var count = lines.length;
        while (index < count) {
            line = lines[index];
            if (emptyLineExp.test(line)) {
                if (state === PrettyPrintState.Default) {
                    lines.splice(index, 1);
                    count -= 1;
                    continue;
                }
            }
            else {
                lineState = state;
                lineDepth = stack.length;
                while (match = tagExp.exec(line)) {
                    if (state === PrettyPrintState.Comment) {
                        if (match[0] === '-->') {
                            state = PrettyPrintState.Default;
                        }
                    }
                    else if (state === PrettyPrintState.Pre) {
                        if (match[2] && match[2].toLowerCase() === preName) {
                            state = PrettyPrintState.Default;
                        }
                    }
                    else {
                        if (match[0] === '<!--') {
                            state = PrettyPrintState.Comment;
                        }
                        else if (match[1]) {
                            tagName = match[1].toLowerCase();
                            if (tagName in PrettyPrintPlugin_1.IGNORED_TAGS) {
                                continue;
                            }
                            if (tagName in PrettyPrintPlugin_1.PRE_TAGS) {
                                state = PrettyPrintState.Pre;
                                preName = tagName;
                            }
                            else {
                                if (tagName === 'body') {
                                    minLineDepth = 2;
                                }
                                stack.push(tagName);
                            }
                        }
                        else if (match[2]) {
                            tagName = match[2].toLowerCase();
                            if (tagName in PrettyPrintPlugin_1.IGNORED_TAGS) {
                                continue;
                            }
                            var n = stack.lastIndexOf(tagName);
                            if (n !== -1) {
                                stack.length = n;
                            }
                        }
                    }
                }
                if (lineState === PrettyPrintState.Default) {
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
    };
    PrettyPrintPlugin.IGNORED_TAGS = {
        area: true,
        base: true,
        br: true,
        wbr: true,
        col: true,
        command: true,
        embed: true,
        hr: true,
        img: true,
        input: true,
        link: true,
        meta: true,
        param: true,
        source: true
    };
    PrettyPrintPlugin.PRE_TAGS = {
        pre: true,
        code: true,
        textarea: true,
        script: true,
        style: true
    };
    PrettyPrintPlugin = PrettyPrintPlugin_1 = __decorate([
        components_1.Component({ name: 'pretty-print' })
    ], PrettyPrintPlugin);
    return PrettyPrintPlugin;
    var PrettyPrintPlugin_1;
}(components_1.RendererComponent));
exports.PrettyPrintPlugin = PrettyPrintPlugin;
//# sourceMappingURL=PrettyPrintPlugin.js.map