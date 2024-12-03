/**
 * Decompresses Base64-encoded Gzip data and parses it into a JSON object.
 *
 * @param base64 - The Base64-encoded string representing the Gzip-compressed JSON string.
 * @returns A promise that resolves to the parsed JSON object.
 */
export async function decompressJson(base64: string) {
    const binaryData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([binaryData]);
    const decompressedStream = blob
        .stream()
        .pipeThrough(new DecompressionStream("gzip"));
    const decompressedText = await new Response(decompressedStream).text();
    return JSON.parse(decompressedText);
}
