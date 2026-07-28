import { IncomingMessage, ServerResponse } from "http";
import { comedorService } from "../services/comedorService";

function parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(new Error("JSON inválido"));
            }
        });
        req.on("error", reject);
    });
}

function sendResponse(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

function getParam(url: string): string | null {
    const parts = url.split("/");
    return parts.length > 2 ? parts[2] : null;
}

export async function routes(req: IncomingMessage, res: ServerResponse) {
    const url = req.url ?? "";
    const metodo = req.method ?? "";
    const path = url.split("?")[0];

    try {
        if (metodo === "GET" && path === "/categorias") {
            const categorias = await comedorService.listarCategorias();
            sendResponse(res, 200, categorias);
            return;
        }

        if (metodo === "GET" && path?.startsWith("/categorias/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const categoria = await comedorService.buscarCategoriaPorIdConValidacion(id);
            sendResponse(res, 200, categoria);
            return;
        }

        if (metodo === "POST" && path === "/categorias") {
            const body = await parseBody(req);
            if (!body.nombre_categoria) {
                sendResponse(res, 400, { mensaje: "El nombre de categoría es obligatorio." });
                return;
            }
            await comedorService.agregarCategoria(body.nombre_categoria);
            sendResponse(res, 201, { mensaje: "Categoría creada exitosamente." });
            return;
        }

        if (metodo === "PUT" && path?.startsWith("/categorias/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const body = await parseBody(req);
            if (!body.nombre_categoria) {
                sendResponse(res, 400, { mensaje: "El nombre de categoría es obligatorio." });
                return;
            }
            await comedorService.buscarCategoriaPorIdConValidacion(id);
            await comedorService.actualizarCategoria(id, body.nombre_categoria);
            sendResponse(res, 200, { mensaje: "Categoría actualizada exitosamente." });
            return;
        }

        if (metodo === "DELETE" && path?.startsWith("/categorias/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            await comedorService.buscarCategoriaPorIdConValidacion(id);
            await comedorService.eliminarCategoria(id);
            sendResponse(res, 200, { mensaje: "Categoría eliminada exitosamente." });
            return;
        }

        if (metodo === "GET" && path === "/productos") {
            const productos = await comedorService.listarInventario();
            sendResponse(res, 200, productos);
            return;
        }

        if (metodo === "GET" && path?.startsWith("/productos/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const producto = await comedorService.buscarProductoPorIdConValidacion(id);
            sendResponse(res, 200, producto);
            return;
        }

        if (metodo === "POST" && path === "/productos") {
            const body = await parseBody(req);
            if (!body.id_categoria || !body.nombre_producto || !body.unidad_medida || !body.fecha_vencimiento) {
                sendResponse(res, 400, { 
                    mensaje: "Campos obligatorios: id_categoria, nombre_producto, unidad_medida, fecha_vencimiento" 
                });
                return;
            }
            await comedorService.agregarProducto({
                id_categoria: body.id_categoria,
                nombre_producto: body.nombre_producto,
                unidad_medida: body.unidad_medida,
                stock_minimo: body.stock_minimo || 5,
                fecha_vencimiento: body.fecha_vencimiento
            });
            sendResponse(res, 201, { mensaje: "Producto creado exitosamente." });
            return;
        }

        if (metodo === "PUT" && path?.startsWith("/productos/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const body = await parseBody(req);
            if (!body.nombre_producto) {
                sendResponse(res, 400, { mensaje: "El nombre del producto es obligatorio." });
                return;
            }
            await comedorService.buscarProductoPorIdConValidacion(id);
            await comedorService.actualizarProducto(
                id, 
                body.nombre_producto, 
                body.stock_minimo || 5, 
                body.fecha_vencimiento
            );
            sendResponse(res, 200, { mensaje: "Producto actualizado exitosamente." });
            return;
        }

        if (metodo === "DELETE" && path?.startsWith("/productos/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            await comedorService.buscarProductoPorIdConValidacion(id);
            await comedorService.eliminarProducto(id);
            sendResponse(res, 200, { mensaje: "Producto eliminado exitosamente." });
            return;
        }

        if (metodo === "GET" && path === "/personal") {
            const personal = await comedorService.listarPersonal();
            sendResponse(res, 200, personal);
            return;
        }

        if (metodo === "GET" && path?.startsWith("/personal/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const persona = await comedorService.buscarPersonalPorIdConValidacion(id);
            sendResponse(res, 200, persona);
            return;
        }

        if (metodo === "POST" && path === "/personal") {
            const body = await parseBody(req);
            if (!body.correo_login || !body.usuario_login || !body.contrasena_login || 
                !body.id_rol || !body.nombre_personal || !body.apellido_personal || !body.estado_personal) {
                sendResponse(res, 400, { 
                    mensaje: "Campos obligatorios: correo_login, usuario_login, contrasena_login, id_rol, nombre_personal, apellido_personal, estado_personal" 
                });
                return;
            }
            await comedorService.agregarPersonal(body);
            sendResponse(res, 201, { mensaje: "Personal creado exitosamente." });
            return;
        }

        if (metodo === "PUT" && path?.startsWith("/personal/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const body = await parseBody(req);
            if (!body.nombre_personal || !body.apellido_personal || !body.estado_personal) {
                sendResponse(res, 400, { 
                    mensaje: "Campos obligatorios: nombre_personal, apellido_personal, estado_personal" 
                });
                return;
            }
            await comedorService.buscarPersonalPorIdConValidacion(id);
            await comedorService.actualizarPersonal(id, body);
            sendResponse(res, 200, { mensaje: "Personal actualizado exitosamente." });
            return;
        }

        if (metodo === "DELETE" && path?.startsWith("/personal/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            await comedorService.buscarPersonalPorIdConValidacion(id);
            await comedorService.eliminarPersonal(id);
            sendResponse(res, 200, { mensaje: "Personal eliminado exitosamente." });
            return;
        }

        if (metodo === "GET" && path === "/donantes") {
            const donantes = await comedorService.listarDonantes();
            sendResponse(res, 200, donantes);
            return;
        }

        if (metodo === "GET" && path?.startsWith("/donantes/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const donante = await comedorService.buscarDonantePorIdConValidacion(id);
            sendResponse(res, 200, donante);
            return;
        }

        if (metodo === "POST" && path === "/donantes") {
            const body = await parseBody(req);
            if (!body.nombre_donante) {
                sendResponse(res, 400, { mensaje: "El nombre del donante es obligatorio." });
                return;
            }
            await comedorService.agregarDonante(body);
            sendResponse(res, 201, { mensaje: "Donante creado exitosamente." });
            return;
        }

        if (metodo === "PUT" && path?.startsWith("/donantes/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const body = await parseBody(req);
            if (!body.nombre_donante) {
                sendResponse(res, 400, { mensaje: "El nombre del donante es obligatorio." });
                return;
            }
            await comedorService.buscarDonantePorIdConValidacion(id);
            await comedorService.actualizarDonante(id, body);
            sendResponse(res, 200, { mensaje: "Donante actualizado exitosamente." });
            return;
        }

        if (metodo === "DELETE" && path?.startsWith("/donantes/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            await comedorService.buscarDonantePorIdConValidacion(id);
            await comedorService.eliminarDonante(id);
            sendResponse(res, 200, { mensaje: "Donante eliminado exitosamente." });
            return;
        }

        if (metodo === "GET" && path === "/movimientos") {
            const historial = await comedorService.listarHistorialMovimientos();
            sendResponse(res, 200, historial);
            return;
        }

        if (metodo === "GET" && path?.startsWith("/movimientos/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const movimiento = await comedorService.buscarMovimientoPorIdConValidacion(id);
            sendResponse(res, 200, movimiento);
            return;
        }

        if (metodo === "POST" && path === "/movimientos") {
            const body = await parseBody(req);
            if (!body.id_producto || !body.tipo_movimiento || !body.cantidad) {
                sendResponse(res, 400, { 
                    mensaje: "Campos obligatorios: id_producto, tipo_movimiento, cantidad" 
                });
                return;
            }
            await comedorService.registrarMovimiento({
                id_producto: body.id_producto,
                id_personal: body.id_personal || 1,
                tipo_movimiento: body.tipo_movimiento,
                cantidad: body.cantidad,
                comentario: body.comentario || undefined
            });
            sendResponse(res, 201, { mensaje: "Movimiento registrado exitosamente." });
            return;
        }

        if (metodo === "PUT" && path?.startsWith("/movimientos/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const body = await parseBody(req);
            if (!body.comentario) {
                sendResponse(res, 400, { mensaje: "El comentario es obligatorio para actualizar." });
                return;
            }
            await comedorService.buscarMovimientoPorIdConValidacion(id);
            await comedorService.actualizarMovimiento(id, body.comentario);
            sendResponse(res, 200, { mensaje: "Movimiento actualizado exitosamente." });
            return;
        }

        if (metodo === "DELETE" && path?.startsWith("/movimientos/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            await comedorService.buscarMovimientoPorIdConValidacion(id);
            await comedorService.eliminarMovimiento(id);
            sendResponse(res, 200, { mensaje: "Movimiento eliminado exitosamente." });
            return;
        }

        if (metodo === "GET" && path === "/promesas") {
            const promesas = await comedorService.listarTodasPromesas();
            sendResponse(res, 200, promesas);
            return;
        }

        if (metodo === "GET" && path?.startsWith("/promesas/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const promesa = await comedorService.buscarPromesaPorIdConValidacion(id);
            sendResponse(res, 200, promesa);
            return;
        }

        if (metodo === "POST" && path === "/promesas") {
            const body = await parseBody(req);
            if (!body.id_donante || !body.descripcion_producto || !body.cantidad || !body.unidad_medida) {
                sendResponse(res, 400, { 
                    mensaje: "Campos obligatorios: id_donante, descripcion_producto, cantidad, unidad_medida" 
                });
                return;
            }
            await comedorService.registrarPromesa(body);
            sendResponse(res, 201, { mensaje: "Promesa registrada exitosamente." });
            return;
        }

        if (metodo === "PUT" && path?.startsWith("/promesas/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            const body = await parseBody(req);
            if (!body.estado) {
                sendResponse(res, 400, { mensaje: "El estado es obligatorio: pendiente, recibida, rechazada" });
                return;
            }
            await comedorService.buscarPromesaPorIdConValidacion(id);
            await comedorService.actualizarPromesa(id, body);
            sendResponse(res, 200, { mensaje: "Promesa actualizada exitosamente." });
            return;
        }

        if (metodo === "DELETE" && path?.startsWith("/promesas/")) {
            const id = parseInt(getParam(path) || "0");
            if (isNaN(id) || id <= 0) {
                sendResponse(res, 400, { mensaje: "ID inválido. Debe ser un número entero positivo." });
                return;
            }
            await comedorService.buscarPromesaPorIdConValidacion(id);
            await comedorService.eliminarPromesa(id);
            sendResponse(res, 200, { mensaje: "Promesa eliminada exitosamente." });
            return;
        }

        if (metodo === "GET" && path === "/reportes/bajo-stock") {
            const reporte = await comedorService.reporteBajoStock();
            sendResponse(res, 200, reporte);
            return;
        }

        if (metodo === "GET" && path === "/reportes/proximos-vencer") {
            const reporte = await comedorService.reporteProximosVencer();
            sendResponse(res, 200, reporte);
            return;
        }

        sendResponse(res, 404, { 
            mensaje: "Endpoint no encontrado",
            rutas_disponibles: {
                categorias: "GET, GET /:id, POST, PUT /:id, DELETE /:id",
                productos: "GET, GET /:id, POST, PUT /:id, DELETE /:id",
                personal: "GET, GET /:id, POST, PUT /:id, DELETE /:id",
                donantes: "GET, GET /:id, POST, PUT /:id, DELETE /:id",
                movimientos: "GET, GET /:id, POST, PUT /:id, DELETE /:id",
                promesas: "GET, GET /:id, POST, PUT /:id, DELETE /:id",
                reportes: "GET /reportes/bajo-stock, GET /reportes/proximos-vencer"
            }
        });

    } catch (error: any) {
        sendResponse(res, 500, { mensaje: error.message });
    }
}