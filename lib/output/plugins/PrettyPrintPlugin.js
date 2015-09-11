var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var component_1 = require("../../utils/component");
var Renderer_1 = require("../Renderer");
var PrettyPrintState;
(function (PrettyPrintState) {
    PrettyPrintState[PrettyPrintState["Default"] = 0] = "Default";
    PrettyPrintState[PrettyPrintState["Comment"] = 1] = "Comment";
    PrettyPrintState[PrettyPrintState["Pre"] = 2] = "Pre";
})(PrettyPrintState || (PrettyPrintState = {}));
var PrettyPrintPlugin = (function (_super) {
    __extends(PrettyPrintPlugin, _super);
    function PrettyPrintPlugin() {
        _super.apply(this, arguments);
    }
    PrettyPrintPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[Renderer_1.Renderer.EVENT_END_PAGE] = this.onRendererEndPage,
            _a
        ), void 0, -1024);
        var _a;
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
                if (state == PrettyPrintState.Default) {
                    lines.splice(index, 1);
                    count -= 1;
                    continue;
                }
            }
            else {
                lineState = state;
                lineDepth = stack.length;
                while (match = tagExp.exec(line)) {
                    if (state == PrettyPrintState.Comment) {
                        if (match[0] == '-->') {
                            state = PrettyPrintState.Default;
                        }
                    }
                    else if (state == PrettyPrintState.Pre) {
                        if (match[2] && match[2].toLowerCase() == preName) {
                            state = PrettyPrintState.Default;
                        }
                    }
                    else {
                        if (match[0] == '<!--') {
                            state = PrettyPrintState.Comment;
                        }
                        else if (match[1]) {
                            tagName = match[1].toLowerCase();
                            if (tagName in PrettyPrintPlugin.IGNORED_TAGS)
                                continue;
                            if (tagName in PrettyPrintPlugin.PRE_TAGS) {
                                state = PrettyPrintState.Pre;
                                preName = tagName;
                            }
                            else {
                                if (tagName == 'body')
                                    minLineDepth = 2;
                                stack.push(tagName);
                            }
                        }
                        else if (match[2]) {
                            tagName = match[2].toLowerCase();
                            if (tagName in PrettyPrintPlugin.IGNORED_TAGS)
                                continue;
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
    PrettyPrintPlugin = __decorate([
        component_1.Component("pretty-print"), 
        __metadata('design:paramtypes', [])
    ], PrettyPrintPlugin);
    return PrettyPrintPlugin;
})(component_1.RendererComponent);
exports.PrettyPrintPlugin = PrettyPrintPlugin;
