import { IncomingMessage, ServerResponse } from "http";
import { comedorService } from "../services/comedor.js";

export async function routes(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-Type", "application/json");
    const url = req.url ?? "";
    const metodo = req.method ?? "";

    try {
        if (metodo === "GET" && url === "/productos") {
            const productos = await comedorService.listarInventario();
            res.writeHead(200);
            res.end(JSON.stringify(productos));
            return;
        }

        if (metodo === "POST" && url === "/productos") {
            let body = "";
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", async () => {
                try {
                    const prod = JSON.parse(body);
                    if(!prod.nombre_producto || !prod.id_categoria) throw new Error("Parámetros obligatorios ausentes.");
                    await comedorService.agregarProducto(prod);
                    res.writeHead(201);
                    res.end(JSON.stringify({ mensaje: "Producto agregado con éxito" }));
                } catch (error: any) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ mensaje: error.message }));
                }
            });
            return;
        }

        if (metodo === "GET" && url === "/reportes/bajo-stock") {
            const reporte = await comedorService.reporteBajoStock();
            res.writeHead(200);
            res.end(JSON.stringify(reporte));
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ mensaje: "Endpoint no encontrado o requiere login por consola" }));
    } catch (error: any) {
        res.writeHead(500);
        res.end(JSON.stringify({ mensaje: error.message }));
    }
}
