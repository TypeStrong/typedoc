export const abc = 123;

export { abc as rename1 };

import { rename1 } from "./gh2811.js";
export { rename1 as rename2 };
