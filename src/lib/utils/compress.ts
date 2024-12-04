import { gzip } from "zlib";
import { promisify } from "util";

const gzipP = promisify(gzip);

/**
 * Compresses a JSON-serializable object into a Base64-encoded Gzip string.
 *
 * @param data - The JSON-serializable object to compress.
 * @returns A promise that resolves to a Base64-encoded string of the Gzip-compressed data.
 */
export async function compressJson(data: any) {
    const gz = await gzipP(Buffer.from(JSON.stringify(data)));
    return gz.toString("base64");
}
