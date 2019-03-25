import * as github from '../lib/converter/plugins/GitHubPlugin';
import Assert = require('assert');

describe('GitHubRepository', function() {

    describe('contructor', function() {
        it('must default to github.com hostname', function() {
            let repository = new github.Repository('', '', []);

            Assert.equal(repository.gitHubHostname, 'github.com');
        });

        it('must correctly handle an enterprise github URL hostname', function() {
            let mockRemotes = [
                'git@github.acme.com:joebloggs/foobar.git'
            ];

            let repository = new github.Repository('', '', mockRemotes);

            Assert.equal(repository.gitHubHostname, 'github.acme.com');
        });
    });
});
