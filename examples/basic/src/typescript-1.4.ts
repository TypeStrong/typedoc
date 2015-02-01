interface RunOptions {
    program: string;
    commandline: string[]|string;
}

type PrimitiveArray = Array<string|number|boolean>;
type MyNumber = number;
type MyRunOptions = RunOptions;
type Callback = () => void;

var callback:Callback;

function functionUsingTypes(data:PrimitiveArray, callback:Callback):MyNumber {
    return 10;
}