import { Application } from '..';
import Assert = require('assert');

describe('PluginHost', function () {
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
