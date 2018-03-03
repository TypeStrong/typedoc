"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var Assert = require("assert");
describe('PluginHost', function () {
    it('parses plugins correctly', function () {
        var app = new __1.Application({
            plugin: 'typedoc-plugin-1,typedoc-plugin-2'
        });
        Assert.deepEqual(app.plugins.plugins, [
            'typedoc-plugin-1',
            'typedoc-plugin-2'
        ]);
    });
});
//# sourceMappingURL=plugin-host.js.map