"use strict";
var UrlMapping = (function () {
    function UrlMapping(url, model, template) {
        this.url = url;
        this.model = model;
        this.template = template;
    }
    return UrlMapping;
}());
exports.UrlMapping = UrlMapping;
