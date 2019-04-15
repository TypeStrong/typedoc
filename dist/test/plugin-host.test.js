"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const Assert = require("assert");
const mockery = require("mockery");
describe('PluginHost', function () {
    before(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        mockery.registerMock('typedoc-plugin-1', () => { });
        mockery.registerMock('typedoc-plugin-2', () => { });
    });
    after(function () {
        mockery.disable();
    });
    it('parses plugins correctly', function () {
        let app = new __1.Application({
            plugin: 'typedoc-plugin-1,typedoc-plugin-2'
        });
        Assert.deepEqual(app.plugins.plugins, [
            'typedoc-plugin-1',
            'typedoc-plugin-2'
        ]);
    });
});
//# sourceMappingURL=plugin-host.test.js.map