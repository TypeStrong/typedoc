import { Application } from '..';
import Assert = require('assert');
import * as mockery from 'mockery';

describe('PluginHost', function () {
  before (function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.registerMock('typedoc-plugin-1', () => {});
    mockery.registerMock('typedoc-plugin-2', () => {});
  });

  after(function ()  {
    mockery.disable();
  });

  it('parses plugins correctly', function () {
    let app = new Application({
      plugin: 'typedoc-plugin-1,typedoc-plugin-2'
    });

    Assert.deepEqual(app.plugins.plugins, [
      'typedoc-plugin-1',
      'typedoc-plugin-2'
    ]);
  });
});
