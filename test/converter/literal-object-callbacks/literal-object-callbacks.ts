/// <reference path="../lib.core.d.ts" />

var onSuccess: any = function () { };
var onError: any = function () { };
var onFinally: any = function () { };

var callbackReturn = {
    success: (success_callback: () => any) => {
        onSuccess = success_callback;
        return callbackReturn;
    },
    error: (error_callback: () => any) => {
        onError = error_callback;
        return callbackReturn;
    },
    finally: (finally_callback: () => any) => {
        onFinally = finally_callback;
        return callbackReturn;
    }
};