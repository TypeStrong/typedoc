let onSuccess: any = function () { };
let onError: any = function () { };
let onFinally: any = function () { };

const callbackReturn = {
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
