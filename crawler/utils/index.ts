import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const VIRTUAL_UA
    = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function get__dirname() {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    return __dirname
}

export {
    __dirname,
    __filename,
    get__dirname,
    VIRTUAL_UA,
}
