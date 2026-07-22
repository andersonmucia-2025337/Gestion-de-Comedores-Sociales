import { iniciarServidor } from "./api/server.js";
import { ejecutarPruebasBackend } from "./utils/testRunner.js";

async function main() {
    iniciarServidor();

    await ejecutarPruebasBackend();
}

main();
