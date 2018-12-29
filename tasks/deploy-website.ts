import ghpages = require('gh-pages');

// TODO: Generate api documentation

// Pugh to GitHub
ghpages.publish('../website', {
  repo: 'https://github.com/TypeStrong/typedoc-site.git'
}, function () {
  console.log('Deployment completed');
});
