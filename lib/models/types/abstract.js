"use strict";
var Type = (function () {
    function Type() {
        this.isArray = false;
    }
    Type.prototype.equals = function (type) {
        return false;
    };
    Type.prototype.toObject = function () {
        var result = {};
        result.type = 'void';
        if (this.isArray) {
            result.isArray = this.isArray;
        }
        return result;
    };
    Type.prototype.toString = function () {
        return 'void';
    };
    Type.isTypeListSimiliar = function (a, b) {
        if (a.length != b.length)
            return false;
        outerLoop: for (var an = 0, count = a.length; an < count; an++) {
            var at = a[an];
            for (var bn = 0; bn < count; bn++) {
                if (b[bn].equals(at))
                    continue outerLoop;
            }
            return false;
        }
        return true;
    };
    Type.isTypeListEqual = function (a, b) {
        if (a.length != b.length)
            return false;
        for (var index = 0, count = a.length; index < count; index++) {
            if (!a[index].equals(b[index])) {
                return false;
            }
        }
        return true;
    };
    return Type;
}());
exports.Type = Type;
