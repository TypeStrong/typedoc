var ConverterPlugin = (function () {
    function ConverterPlugin(converter) {
        this.converter = converter;
    }
    ConverterPlugin.prototype.remove = function () {
        this.converter.off(null, null, this);
        this.converter = null;
    };
    return ConverterPlugin;
})();
exports.ConverterPlugin = ConverterPlugin;
