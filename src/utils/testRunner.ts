import * as readline from "readline";
import { comedorService } from "../services/comedor.js";
import { pool } from "../data/db.js";
import { SesionUsuario } from "../models/comedor.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const preguntar = (interrogante: string): Promise<string> => {
    return new Promise((resolve) => rl.question(interrogante, resolve));
};

export async function ejecutarPruebasBackend() {
    console.log("\n======================================================");
    console.log("🔒 SISTEMA DE ACCESO - GESTIÓN DE COMEDORES SOCIALES");
    console.log("======================================================");
    console.log("1. Iniciar Sesión");
    console.log("2. Registrarse");
    
    const opcionAcceso = await preguntar("Seleccione una opción (1-2): ");
    let sesion: SesionUsuario | null = null;

    try {
        if (opcionAcceso.trim() === "2") {
            console.log("\n--- FORMULARIO DE REGISTRO ---");
            const nombre = await preguntar("Nombre propio: ");
            const apellido = await preguntar("Apellido: ");
            const correo = await preguntar("Correo electrónico: ");
            const usuario = await preguntar("Nombre de usuario único: ");
            const contrasena = await preguntar("Contraseña: ");
            console.log("Roles permitted: admin, almacenista, donante");
            
            // Corrección aquí: Paréntesis agregados para evaluar la respuesta de la promesa primero
            const rolIngresado = (await preguntar("Rol: ")).trim().toLowerCase();

            if (rolIngresado !== "admin" && rolIngresado !== "almacenista" && rolIngresado !== "donante") {
                throw new Error("Rol inválido. Registro cancelado.");
            }

            await comedorService.registrarUsuarioHibrido({
                nombre, apellido, correo, usuario, contrasena, rol: rolIngresado as any
            });
            console.log("✅ Registro exitoso. Por favor inicie sesión.");
        }

        console.log("\n--- AUTENTICACIÓN ---");
        const user = await preguntar("Usuario: ");
        const pass = await preguntar("Contraseña: ");
        sesion = await comedorService.iniciarSesion(user, pass);

        if (!sesion) {
            console.log("❌ Credenciales inválidas. Cerrando programa.");
            rl.close();
            await pool.end();
            return;
        }

        console.log(`\n🎉 ¡Bienvenido ${sesion.usuario_login}! Rol asignado: [${sesion.nombre_rol.toUpperCase()}]`);
        await ejecutarMenuPorRol(sesion);

    } catch (err: any) {
        console.error("\n❌ Error en acceso:", err.message);
        rl.close();
        await pool.end();
    }
}

async function ejecutarMenuPorRol(usuario: SesionUsuario) {
    let continuar = true;

    while (continuar) {
        console.log(`\n======================================================`);
        console.log(`🍔 MENÚ INTERACTIVO - ROLES Y PERMISOS: [${usuario.nombre_rol.toUpperCase()}]`);
        console.log(`======================================================`);

        if (usuario.nombre_rol === "admin") {
            console.log("1. [ADMIN] Crear Categoría");
            console.log("2. [ADMIN] Listar Todas las Categorías");
            console.log("3. [ADMIN] Buscar Producto por ID");
            console.log("4. [ADMIN] Eliminar Producto");
        } else if (usuario.nombre_rol === "almacenista") {
            console.log("1. [ALMACÉN] Registrar Producto");
            console.log("2. [ALMACÉN] Listar Inventario de Productos");
            console.log("3. [ALMACÉN] Registrar Entrada / Salida Stock");
            console.log("4. [ALMACÉN] Reporte: Alerta Bajo Stock (Innovación)");
            console.log("5. [ALMACÉN] Reporte: Productos Próximos a Vencer (Innovación)");
            console.log("6. [ALMACÉN] Consultar Historial de Movimientos");
        } else if (usuario.nombre_rol === "donante") {
            console.log("1. [DONANTE] Registrar Promesa de Donación (Innovación)");
            console.log("2. [DONANTE] Consultar Historial de Mis Aportes");
        }

        console.log("8. Salir del Programa");
        console.log("======================================================");

        const opcion = await preguntar("Seleccione una opción: ");

        try {
            if (opcion.trim() === "8") {
                continuar = false;
                rl.close();
                await pool.end();
                console.log("👋 ¡Hasta luego!");
                process.exit(0);
            }

            if (usuario.nombre_rol === "admin") {
                if (opcion === "1") {
                    const n = await preguntar("Nombre de categoría: ");
                    await comedorService.agregarCategoria(n);
                    console.log("✅ Categoría creada.");
                } else if (opcion === "2") {
                    console.table(await comedorService.listarCategorias());
                } else if (opcion === "3") {
                    const id = parseInt(await preguntar("ID del Producto: "), 10);
                    console.table(await comedorService.buscarProductoPorId(id));
                } else if (opcion === "4") {
                    const id = parseInt(await preguntar("ID del Producto a eliminar: "), 10);
                    await comedorService.eliminarProducto(id);
                    console.log("✅ Producto eliminado.");
                }
            }

            if (usuario.nombre_rol === "almacenista") {
                if (opcion === "1") {
                    const id_cat = parseInt(await preguntar("ID de la Categoría: "), 10);
                    const nom = await preguntar("Nombre del producto: ");
                    const uni = await preguntar("Unidad de medida: ");
                    const stock = parseFloat(await preguntar("Stock mínimo: ") || "5");
                    const fecha = await preguntar("Fecha de vencimiento (YYYY-MM-DD): ");
                    await comedorService.agregarProducto({ id_categoria: id_cat, nombre_producto: nom, unidad_medida: uni, stock_minimo: stock, fecha_vencimiento: fecha });
                    console.log("✅ Producto guardado por el almacenista.");
                } else if (opcion === "2") {
                    console.table(await comedorService.listarInventario());
                } else if (opcion === "3") {
                    const prodId = parseInt(await preguntar("ID Producto: "), 10);
                    const tipo = (await preguntar("Tipo (entrada/salida): ")).trim() as any;
                    const cant = parseFloat(await preguntar("Cantidad: "));
                    const com = await preguntar("Comentario: ");
                    await comedorService.registrarMovimiento({ id_producto: prodId, id_personal: usuario.id_personal || 1, tipo_movimiento: tipo, cantidad: cant, comentario: com });
                    console.log("✅ Inventario modificado con éxito.");
                } else if (opcion === "4") {
                    console.log("\n⚠️ ALERTA DE STOCK BAJO:");
                    console.table(await comedorService.reporteBajoStock());
                } else if (opcion === "5") {
                    console.log("\n📅 PRODUCTOS PRÓXIMOS A VENCER (30 DÍAS):");
                    console.table(await comedorService.reporteProximosVencer());
                } else if (opcion === "6") {
                    console.table(await comedorService.listarHistorialMovimientos());
                }
            }

            if (usuario.nombre_rol === "donante") {
                if (opcion === "1") {
                    const desc = await preguntar("¿Qué producto deseas prometer? (ej: Frijol negro): ");
                    const cant = parseFloat(await preguntar("Cantidad: "));
                    const uni = await preguntar("Unidad de medida (ej: libras): ");
                    await comedorService.registrarPromesa({ id_donante: usuario.id_donante || 1, descripcion_producto: desc, cantidad: cant, unidad_medida: uni });
                    console.log("✅ Solicitud de donación enviada al Almacén como 'pendiente'.");
                } else if (opcion === "2") {
                    console.log("\n📋 HISTORIAL PERSONAL DE PROMESAS Y APORTES:");
                    console.table(await comedorService.listarPromesasPorDonante(usuario.id_donante || 1));
                }
            }

        } catch (error: any) {
            console.error("\n❌ Error en operación:", error.message);
        }

        if (continuar) {
            await preguntar("\nPresione [Enter] para continuar...");
        }
    }
}
