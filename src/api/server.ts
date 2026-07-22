import * as http from "http";
import { routes } from "./router.js";

export function iniciarServidor() {
    const servidor = http.createServer(async (req, res) => {
        await routes(req, res);
    });

    servidor.listen(3000, () => {
        console.log("\n===================================");
        console.log("🚀 Servidor HTTP Activo para Postman");
        console.log("🔗 http://localhost:3000");
        console.log("===================================");
    });
}
