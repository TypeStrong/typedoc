var Theme = (function () {
    function Theme(renderer, basePath) {
        this.renderer = renderer;
        this.basePath = basePath;
    }
    Theme.prototype.isOutputDirectory = function (path) {
        return false;
    };
    Theme.prototype.getUrls = function (project) {
        return [];
    };
    Theme.prototype.getNavigation = function (project) {
        return null;
    };
    return Theme;
})();
exports.Theme = Theme;
