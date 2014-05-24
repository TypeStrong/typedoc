module TypeDoc
{
    /**
     *
     * @param file
     * @returns {TypeScript.FileInformation}
     */
    export function readFile(file):string
    {
        var buffer = FS.readFileSync(file);
        switch (buffer[0]) {
            case 0xFE:
                if (buffer[1] === 0xFF) {
                    var i = 0;
                    while ((i + 1) < buffer.length) {
                        var temp = buffer[i];
                        buffer[i] = buffer[i + 1];
                        buffer[i + 1] = temp;
                        i += 2;
                    }
                    return buffer.toString("ucs2", 2);
                }
                break;
            case 0xFF:
                if (buffer[1] === 0xFE) {
                    return buffer.toString("ucs2", 2);
                }
                break;
            case 0xEF:
                if (buffer[1] === 0xBB) {
                    return buffer.toString("utf8", 3);
                }
        }

        return buffer.toString("utf8", 0);
    }
}