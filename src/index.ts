import { iniciarServidor } from "./api/server";
import { mostrarMenuPrincipal } from "./menu/menu";

async function main() {
    iniciarServidor();
    await mostrarMenuPrincipal();
}

main();