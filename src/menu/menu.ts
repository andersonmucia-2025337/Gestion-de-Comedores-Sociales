import * as readline from "readline";
import { comedorService } from "../services/comedorService";
import { pool } from "../data/db";
import { SesionUsuario } from "../models/sesion";
import { 
  categoriaValidation, 
  productoValidation, 
  personalValidation, 
  donanteValidation, 
  movimientoValidation, 
  promesaValidation, 
  sesionValidation,
  generalValidation,
  Validador 
} from "../utils/validations/index";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const preguntar = (interrogante: string): Promise<string> => {
    return new Promise((resolve) => rl.question(interrogante, resolve));
};

function limpiarPantalla() {
    console.clear();
}

function pausar(): Promise<void> {
    return new Promise((resolve) => {
        rl.question("\nPresione [Enter] para continuar...", () => {
            resolve();
        });
    });
}

function preguntarOpcion(mensaje: string, opcionesValidas: string[]): Promise<string> {
    return new Promise((resolve) => {
        function hacerPregunta() {
            rl.question(mensaje, (respuesta) => {
                const respuestaTrim = respuesta.trim();
                if (respuestaTrim === "") {
                    console.log("╔════════════════════════════════════════════════════════════╗");
                    console.log("║  ❌ ERROR: No se permiten campos vacíos.                   ║");
                    console.log("║     Por favor, seleccione una opción válida.              ║");
                    console.log("╚════════════════════════════════════════════════════════════╝");
                    hacerPregunta();
                } else if (opcionesValidas.includes(respuestaTrim)) {
                    resolve(respuestaTrim);
                } else {
                    console.log(`╔════════════════════════════════════════════════════════════╗`);
                    console.log(`║  ❌ ERROR: Opción no válida.                               ║`);
                    console.log(`║     Solo se permiten: ${opcionesValidas.join(", ")}        ║`);
                    console.log(`╚════════════════════════════════════════════════════════════╝`);
                    hacerPregunta();
                }
            });
        }
        hacerPregunta();
    });
}

async function validarInput(mensaje: string, validador: Validador): Promise<string> {
    while (true) {
        const input = await preguntar(mensaje);
        const error = validador(input);
        if (error) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log(`║  ❌ ERROR: ${error.padEnd(49)}║`);
            console.log("╚════════════════════════════════════════════════════════════╝");
        } else {
            return input;
        }
    }
}

async function validarInputNumero(mensaje: string): Promise<number> {
    const input = await validarInput(mensaje, generalValidation.numeroEnteroPositivo);
    return parseInt(input);
}

async function validarInputFloat(mensaje: string): Promise<number> {
    const input = await validarInput(mensaje, generalValidation.numeroPositivo);
    return parseFloat(input);
}

function mostrarExito(mensaje: string) {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log(`║  ✅ ${mensaje.padEnd(49)}║`);
    console.log("╚════════════════════════════════════════════════════════════╝");
}

function mostrarInfo(mensaje: string) {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log(`║  ℹ️  ${mensaje.padEnd(49)}║`);
    console.log("╚════════════════════════════════════════════════════════════╝");
}

export async function mostrarMenuPrincipal() {
    let salir = false;

    while (!salir) {
        limpiarPantalla();
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║      🔒 SISTEMA DE GESTIÓN DE COMEDORES SOCIALES         ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║  1. Iniciar Sesión                                        ║");
        console.log("║  2. Registrarse                                           ║");
        console.log("║  3. Salir del Sistema                                     ║");
        console.log("╚════════════════════════════════════════════════════════════╝");

        const opcionAcceso = await preguntarOpcion("➤ Seleccione una opción (1-3): ", ["1", "2", "3"]);

        if (opcionAcceso === "3") {
            console.log("\n╔════════════════════════════════════════════════════════════╗");
            console.log("║  👋 ¡Hasta luego! Gracias por usar el sistema.            ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            rl.close();
            await pool.end();
            process.exit(0);
        }

        try {
            if (opcionAcceso === "2") {
                await mostrarRegistro();
            }

            if (opcionAcceso === "1") {
                await mostrarLogin();
            }

        } catch (error: any) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log(`║  ❌ ERROR: ${error.message.padEnd(49)}║`);
            console.log("╚════════════════════════════════════════════════════════════╝");
            await pausar();
        }
    }
}

async function mostrarRegistro() {
    limpiarPantalla();
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  📝 FORMULARIO DE REGISTRO DE USUARIO                    ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    const nombre = await validarInput("➤ Nombre propio: ", personalValidation.nombre);
    const apellido = await validarInput("➤ Apellido: ", personalValidation.apellido);
    const correo = await validarInput("➤ Correo electrónico: ", personalValidation.correo);
    const usuario = await validarInput("➤ Nombre de usuario único: ", personalValidation.usuario);
    const contrasena = await validarInput("➤ Contraseña (mínimo 8 caracteres, mayúscula, minúscula, número y especial): ", personalValidation.contrasena);
    const rolInput = await validarInput("➤ Rol (admin/almacenista/donante): ", sesionValidation.nombreRol);
    const rol = rolInput.toLowerCase() as "admin" | "almacenista" | "donante";

    try {
        await comedorService.registrarUsuarioHibrido({
            nombre,
            apellido,
            correo,
            usuario,
            contrasena,
            rol
        });
        mostrarExito("Registro exitoso. Por favor inicie sesión.");
    } catch (error: any) {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log(`║  ❌ ERROR: ${error.message.padEnd(49)}║`);
        console.log("╚════════════════════════════════════════════════════════════╝");
    }

    await pausar();
}

async function mostrarLogin() {
    limpiarPantalla();
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  🔐 INICIO DE SESIÓN                                     ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    const user = await preguntar("➤ Usuario: ");
    const pass = await preguntar("➤ Contraseña: ");

    try {
        const sesion = await comedorService.iniciarSesion(user, pass);

        if (!sesion) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║  ❌ ERROR: Credenciales inválidas.                         ║");
            console.log("║     Verifique su usuario y contraseña.                    ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            await pausar();
            return;
        }

        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log(`║  🎉 Bienvenido ${sesion.usuario_login} Rol: [${sesion.nombre_rol.toUpperCase()}] ║`);
        console.log("╚════════════════════════════════════════════════════════════╝");
        await mostrarMenuPorRol(sesion);

    } catch (error: any) {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log(`║  ❌ ERROR: ${error.message.padEnd(49)}║`);
        console.log("╚════════════════════════════════════════════════════════════╝");
        await pausar();
    }
}

async function mostrarMenuPorRol(usuario: SesionUsuario) {
    let continuar = true;

    while (continuar) {
        limpiarPantalla();
        console.log(`╔════════════════════════════════════════════════════════════╗`);
        console.log(`║  🍔 MENÚ PRINCIPAL - ROL: [${usuario.nombre_rol.toUpperCase()}]${" ".repeat(40 - usuario.nombre_rol.length)}║`);
        console.log(`╚════════════════════════════════════════════════════════════╝`);

        if (usuario.nombre_rol === "admin") {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║  ---- GESTIÓN DE CATEGORÍAS ----                         ║");
            console.log("║  1. Crear Categoría                                      ║");
            console.log("║  2. Listar Categorías                                    ║");
            console.log("║  3. Actualizar Categoría                                 ║");
            console.log("║  4. Eliminar Categoría                                   ║");
            console.log("║  ---- GESTIÓN DE PRODUCTOS ----                          ║");
            console.log("║  5. Crear Producto                                       ║");
            console.log("║  6. Listar Productos                                     ║");
            console.log("║  7. Buscar Producto por ID                               ║");
            console.log("║  8. Actualizar Producto                                  ║");
            console.log("║  9. Eliminar Producto                                    ║");
            console.log("║  ---- GESTIÓN DE PERSONAL ----                           ║");
            console.log("║  10. Listar Personal                                     ║");
            console.log("║  11. Buscar Personal por ID                              ║");
            console.log("║  12. Crear Personal                                      ║");
            console.log("║  13. Actualizar Personal                                 ║");
            console.log("║  14. Eliminar Personal                                   ║");
            console.log("║  ---- GESTIÓN DE DONANTES ----                           ║");
            console.log("║  15. Listar Donantes                                     ║");
            console.log("║  16. Buscar Donante por ID                               ║");
            console.log("║  17. Crear Donante                                       ║");
            console.log("║  18. Actualizar Donante                                  ║");
            console.log("║  19. Eliminar Donante                                    ║");
            console.log("║  ---- GESTIÓN DE MOVIMIENTOS ----                        ║");
            console.log("║  20. Registrar Movimiento                                ║");
            console.log("║  21. Historial de Movimientos                            ║");
            console.log("║  22. Buscar Movimiento por ID                            ║");
            console.log("║  23. Actualizar Movimiento                               ║");
            console.log("║  24. Eliminar Movimiento                                 ║");
            console.log("║  ---- GESTIÓN DE PROMESAS ----                           ║");
            console.log("║  25. Registrar Promesa                                   ║");
            console.log("║  26. Listar Todas las Promesas                           ║");
            console.log("║  27. Buscar Promesa por ID                               ║");
            console.log("║  28. Actualizar Promesa                                  ║");
            console.log("║  29. Eliminar Promesa                                    ║");
            console.log("║  ---- REPORTES ----                                     ║");
            console.log("║  30. Reporte Bajo Stock                                  ║");
            console.log("║  31. Reporte Próximos a Vencer                           ║");
            console.log("║  ---- SALIR ----                                        ║");
            console.log("║  32. Cerrar Sesión                                       ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
        } else if (usuario.nombre_rol === "almacenista") {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║  1. Registrar Producto                                    ║");
            console.log("║  2. Listar Inventario                                     ║");
            console.log("║  3. Buscar Producto por ID                                ║");
            console.log("║  4. Registrar Movimiento (Entrada/Salida)                 ║");
            console.log("║  5. Historial de Movimientos                              ║");
            console.log("║  6. Reporte Bajo Stock                                    ║");
            console.log("║  7. Reporte Próximos a Vencer                             ║");
            console.log("║  ---- SALIR ----                                         ║");
            console.log("║  8. Cerrar Sesión                                         ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
        } else if (usuario.nombre_rol === "donante") {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║  1. Registrar Promesa de Donación                         ║");
            console.log("║  2. Consultar Mis Promesas                                ║");
            console.log("║  ---- SALIR ----                                         ║");
            console.log("║  3. Cerrar Sesión                                         ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
        }

        let opcionesValidas: string[];
        if (usuario.nombre_rol === "admin") {
            opcionesValidas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32"];
        } else if (usuario.nombre_rol === "almacenista") {
            opcionesValidas = ["1", "2", "3", "4", "5", "6", "7", "8"];
        } else {
            opcionesValidas = ["1", "2", "3"];
        }

        const opcion = await preguntarOpcion("➤ Seleccione una opción: ", opcionesValidas);

        if (usuario.nombre_rol === "admin" && opcion === "32") {
            continuar = false;
            mostrarExito("Sesión cerrada exitosamente.");
            await pausar();
            return;
        }
        if (usuario.nombre_rol === "almacenista" && opcion === "8") {
            continuar = false;
            mostrarExito("Sesión cerrada exitosamente.");
            await pausar();
            return;
        }
        if (usuario.nombre_rol === "donante" && opcion === "3") {
            continuar = false;
            mostrarExito("Sesión cerrada exitosamente.");
            await pausar();
            return;
        }

        try {
            if (usuario.nombre_rol === "admin") {
                await ejecutarOpcionAdmin(opcion);
            } else if (usuario.nombre_rol === "almacenista") {
                await ejecutarOpcionAlmacenista(opcion, usuario);
            } else if (usuario.nombre_rol === "donante") {
                await ejecutarOpcionDonante(opcion, usuario);
            }

        } catch (error: any) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log(`║  ❌ ERROR: ${error.message.padEnd(49)}║`);
            console.log("╚════════════════════════════════════════════════════════════╝");
        }

        await pausar();
    }
}

async function ejecutarOpcionAdmin(opcion: string) {
    switch (opcion) {
        case "1": {
            const nombre = await validarInput("➤ Nombre de categoría: ", categoriaValidation.nombre);
            await comedorService.agregarCategoria(nombre);
            mostrarExito("Categoría creada exitosamente.");
            break;
        }
        case "2": {
            const categorias = await comedorService.listarCategorias();
            if (categorias.length === 0) {
                mostrarInfo("No hay categorías registradas.");
            } else {
                console.table(categorias);
            }
            break;
        }
        case "3": {
            const id = await validarInputNumero("➤ ID de categoría: ");
            await comedorService.buscarCategoriaPorIdConValidacion(id);
            const nombre = await validarInput("➤ Nuevo nombre: ", categoriaValidation.nombre);
            await comedorService.actualizarCategoria(id, nombre);
            mostrarExito("Categoría actualizada exitosamente.");
            break;
        }
        case "4": {
            const id = await validarInputNumero("➤ ID de categoría a eliminar: ");
            await comedorService.buscarCategoriaPorIdConValidacion(id);
            await comedorService.eliminarCategoria(id);
            mostrarExito("Categoría eliminada exitosamente.");
            break;
        }

        case "5": {
            const idCat = await validarInputNumero("➤ ID de categoría: ");
            const nombre = await validarInput("➤ Nombre del producto: ", productoValidation.nombre);
            const unidad = await validarInput("➤ Unidad de medida: ", productoValidation.unidadMedida);
            const stockMin = await validarInputFloat("➤ Stock mínimo: ");
            const fecha = await validarInput("➤ Fecha de vencimiento (YYYY-MM-DD): ", productoValidation.fechaVencimiento);
            await comedorService.agregarProducto({
                id_categoria: idCat,
                nombre_producto: nombre,
                unidad_medida: unidad,
                stock_minimo: stockMin,
                fecha_vencimiento: fecha
            });
            mostrarExito("Producto creado exitosamente.");
            break;
        }
        case "6": {
            const productos = await comedorService.listarInventario();
            if (productos.length === 0) {
                mostrarInfo("No hay productos registrados.");
            } else {
                console.table(productos);
            }
            break;
        }
        case "7": {
            const id = await validarInputNumero("➤ ID del producto: ");
            const producto = await comedorService.buscarProductoPorIdConValidacion(id);
            console.table(producto);
            break;
        }
        case "8": {
            const id = await validarInputNumero("➤ ID del producto: ");
            await comedorService.buscarProductoPorIdConValidacion(id);
            const nombre = await validarInput("➤ Nuevo nombre: ", productoValidation.nombre);
            const stockMin = await validarInputFloat("➤ Nuevo stock mínimo: ");
            const fecha = await validarInput("➤ Nueva fecha de vencimiento (YYYY-MM-DD): ", productoValidation.fechaVencimiento);
            await comedorService.actualizarProducto(id, nombre, stockMin, fecha);
            mostrarExito("Producto actualizado exitosamente.");
            break;
        }
        case "9": {
            const id = await validarInputNumero("➤ ID del producto a eliminar: ");
            await comedorService.buscarProductoPorIdConValidacion(id);
            await comedorService.eliminarProducto(id);
            mostrarExito("Producto eliminado exitosamente.");
            break;
        }

        case "10": {
            const personal = await comedorService.listarPersonal();
            if (personal.length === 0) {
                mostrarInfo("No hay personal registrado.");
            } else {
                console.table(personal);
            }
            break;
        }
        case "11": {
            const id = await validarInputNumero("➤ ID del personal: ");
            const persona = await comedorService.buscarPersonalPorIdConValidacion(id);
            console.table(persona);
            break;
        }
        case "12": {
            const correo = await validarInput("➤ Correo: ", personalValidation.correo);
            const usuario = await validarInput("➤ Usuario: ", personalValidation.usuario);
            const contrasena = await validarInput("➤ Contraseña: ", personalValidation.contrasena);
            const idRol = await validarInputNumero("➤ ID Rol (1=admin, 2=almacenista, 3=donante): ");
            const nombre = await validarInput("➤ Nombre: ", personalValidation.nombre);
            const apellido = await validarInput("➤ Apellido: ", personalValidation.apellido);
            const estado = await validarInput("➤ Estado (activo/inactivo/suspendido): ", personalValidation.estado);
            await comedorService.agregarPersonal({
                correo_login: correo,
                usuario_login: usuario,
                contrasena_login: contrasena,
                id_rol: idRol,
                nombre_personal: nombre,
                apellido_personal: apellido,
                estado_personal: estado
            });
            mostrarExito("Personal creado exitosamente.");
            break;
        }
        case "13": {
            const id = await validarInputNumero("➤ ID del personal: ");
            await comedorService.buscarPersonalPorIdConValidacion(id);
            const nombre = await validarInput("➤ Nuevo nombre: ", personalValidation.nombre);
            const apellido = await validarInput("➤ Nuevo apellido: ", personalValidation.apellido);
            const estado = await validarInput("➤ Nuevo estado (activo/inactivo/suspendido): ", personalValidation.estado);
            await comedorService.actualizarPersonal(id, {
                nombre_personal: nombre,
                apellido_personal: apellido,
                estado_personal: estado
            });
            mostrarExito("Personal actualizado exitosamente.");
            break;
        }
        case "14": {
            const id = await validarInputNumero("➤ ID del personal a eliminar: ");
            await comedorService.buscarPersonalPorIdConValidacion(id);
            await comedorService.eliminarPersonal(id);
            mostrarExito("Personal eliminado exitosamente.");
            break;
        }

        case "15": {
            const donantes = await comedorService.listarDonantes();
            if (donantes.length === 0) {
                mostrarInfo("No hay donantes registrados.");
            } else {
                console.table(donantes);
            }
            break;
        }
        case "16": {
            const id = await validarInputNumero("➤ ID del donante: ");
            const donante = await comedorService.buscarDonantePorIdConValidacion(id);
            console.table(donante);
            break;
        }
        case "17": {
            const nombre = await validarInput("➤ Nombre del donante: ", donanteValidation.nombre);
            const tipo = await validarInput("➤ Tipo (particular/empresa/organización): ", donanteValidation.tipo);
            const telefono = await validarInput("➤ Teléfono (8 dígitos): ", donanteValidation.telefono);
            const idLogin = await preguntar("➤ ID Login (opcional): ");
            await comedorService.agregarDonante({
                nombre_donante: nombre,
                tipo_donante: tipo || null,
                telefono_donante: telefono || null,
                id_login: idLogin ? parseInt(idLogin) : null
            });
            mostrarExito("Donante creado exitosamente.");
            break;
        }
        case "18": {
            const id = await validarInputNumero("➤ ID del donante: ");
            await comedorService.buscarDonantePorIdConValidacion(id);
            const nombre = await validarInput("➤ Nuevo nombre: ", donanteValidation.nombre);
            const tipo = await validarInput("➤ Nuevo tipo (particular/empresa/organización): ", donanteValidation.tipo);
            const telefono = await validarInput("➤ Nuevo teléfono (8 dígitos): ", donanteValidation.telefono);
            await comedorService.actualizarDonante(id, {
                nombre_donante: nombre,
                tipo_donante: tipo || null,
                telefono_donante: telefono || null
            });
            mostrarExito("Donante actualizado exitosamente.");
            break;
        }
        case "19": {
            const id = await validarInputNumero("➤ ID del donante a eliminar: ");
            await comedorService.buscarDonantePorIdConValidacion(id);
            await comedorService.eliminarDonante(id);
            mostrarExito("Donante eliminado exitosamente.");
            break;
        }

        case "20": {
            const idProd = await validarInputNumero("➤ ID del producto: ");
            await comedorService.buscarProductoPorIdConValidacion(idProd);
            const tipoInput = await validarInput("➤ Tipo (entrada/salida): ", movimientoValidation.tipo);
            const tipo = tipoInput.toLowerCase() as "entrada" | "salida";
            const cantidad = await validarInputFloat("➤ Cantidad: ");
            const comentario = await preguntar("➤ Comentario (opcional): ");
            await comedorService.registrarMovimiento({
                id_producto: idProd,
                id_personal: 1,
                tipo_movimiento: tipo,
                cantidad: cantidad,
                comentario: comentario || undefined
            });
            mostrarExito("Movimiento registrado exitosamente.");
            break;
        }
        case "21": {
            const historial = await comedorService.listarHistorialMovimientos();
            if (historial.length === 0) {
                mostrarInfo("No hay movimientos registrados.");
            } else {
                console.table(historial);
            }
            break;
        }
        case "22": {
            const id = await validarInputNumero("➤ ID del movimiento: ");
            const movimiento = await comedorService.buscarMovimientoPorIdConValidacion(id);
            console.table(movimiento);
            break;
        }
        case "23": {
            const id = await validarInputNumero("➤ ID del movimiento: ");
            await comedorService.buscarMovimientoPorIdConValidacion(id);
            const comentario = await validarInput("➤ Nuevo comentario: ", generalValidation.textoNoVacio);
            await comedorService.actualizarMovimiento(id, comentario);
            mostrarExito("Movimiento actualizado exitosamente.");
            break;
        }
        case "24": {
            const id = await validarInputNumero("➤ ID del movimiento a eliminar: ");
            await comedorService.buscarMovimientoPorIdConValidacion(id);
            await comedorService.eliminarMovimiento(id);
            mostrarExito("Movimiento eliminado exitosamente.");
            break;
        }

        case "25": {
            const idDonante = await validarInputNumero("➤ ID del donante: ");
            const descripcion = await validarInput("➤ Descripción del producto: ", promesaValidation.descripcion);
            const cantidad = await validarInputFloat("➤ Cantidad: ");
            const unidad = await validarInput("➤ Unidad de medida: ", promesaValidation.unidadMedida);
            await comedorService.registrarPromesa({
                id_donante: idDonante,
                descripcion_producto: descripcion,
                cantidad: cantidad,
                unidad_medida: unidad
            });
            mostrarExito("Promesa registrada exitosamente.");
            break;
        }
        case "26": {
            const promesas = await comedorService.listarTodasPromesas();
            if (promesas.length === 0) {
                mostrarInfo("No hay promesas registradas.");
            } else {
                console.log("\n📋 TODAS LAS PROMESAS DE DONACIÓN:");
                console.table(promesas);
            }
            break;
        }
        case "27": {
            const id = await validarInputNumero("➤ ID de la promesa: ");
            const promesa = await comedorService.buscarPromesaPorIdConValidacion(id);
            console.table(promesa);
            break;
        }
        case "28": {
            const id = await validarInputNumero("➤ ID de la promesa: ");
            await comedorService.buscarPromesaPorIdConValidacion(id);
            const estado = await validarInput("➤ Nuevo estado (pendiente/recibida/rechazada): ", promesaValidation.estado);
            await comedorService.actualizarPromesa(id, { estado });
            mostrarExito("Promesa actualizada exitosamente.");
            break;
        }
        case "29": {
            const id = await validarInputNumero("➤ ID de la promesa a eliminar: ");
            await comedorService.buscarPromesaPorIdConValidacion(id);
            await comedorService.eliminarPromesa(id);
            mostrarExito("Promesa eliminada exitosamente.");
            break;
        }

        case "30": {
            const reporte = await comedorService.reporteBajoStock();
            if (reporte.length === 0) {
                mostrarInfo("No hay productos con stock bajo.");
            } else {
                console.log("\n⚠️ ALERTA DE STOCK BAJO:");
                console.table(reporte);
            }
            break;
        }
        case "31": {
            const reporte = await comedorService.reporteProximosVencer();
            if (reporte.length === 0) {
                mostrarInfo("No hay productos próximos a vencer.");
            } else {
                console.log("\n📅 PRODUCTOS PRÓXIMOS A VENCER (30 DÍAS):");
                console.table(reporte);
            }
            break;
        }
    }
}

async function ejecutarOpcionAlmacenista(opcion: string, usuario: SesionUsuario) {
    switch (opcion) {
        case "1": {
            const idCat = await validarInputNumero("➤ ID de categoría: ");
            const nombre = await validarInput("➤ Nombre del producto: ", productoValidation.nombre);
            const unidad = await validarInput("➤ Unidad de medida: ", productoValidation.unidadMedida);
            const stockMin = await validarInputFloat("➤ Stock mínimo: ");
            const fecha = await validarInput("➤ Fecha de vencimiento (YYYY-MM-DD): ", productoValidation.fechaVencimiento);
            await comedorService.agregarProducto({
                id_categoria: idCat,
                nombre_producto: nombre,
                unidad_medida: unidad,
                stock_minimo: stockMin,
                fecha_vencimiento: fecha
            });
            mostrarExito("Producto registrado exitosamente.");
            break;
        }
        case "2": {
            const inventario = await comedorService.listarInventario();
            if (inventario.length === 0) {
                mostrarInfo("No hay productos en el inventario.");
            } else {
                console.table(inventario);
            }
            break;
        }
        case "3": {
            const id = await validarInputNumero("➤ ID del producto: ");
            const producto = await comedorService.buscarProductoPorIdConValidacion(id);
            console.table(producto);
            break;
        }
        case "4": {
            const idProd = await validarInputNumero("➤ ID del producto: ");
            await comedorService.buscarProductoPorIdConValidacion(idProd);
            const tipoInput = await validarInput("➤ Tipo (entrada/salida): ", movimientoValidation.tipo);
            const tipo = tipoInput.toLowerCase() as "entrada" | "salida";
            const cantidad = await validarInputFloat("➤ Cantidad: ");
            const comentario = await preguntar("➤ Comentario (opcional): ");
            await comedorService.registrarMovimiento({
                id_producto: idProd,
                id_personal: usuario.id_personal || 1,
                tipo_movimiento: tipo,
                cantidad: cantidad,
                comentario: comentario || undefined
            });
            mostrarExito("Movimiento registrado exitosamente.");
            break;
        }
        case "5": {
            const historial = await comedorService.listarHistorialMovimientos();
            if (historial.length === 0) {
                mostrarInfo("No hay movimientos registrados.");
            } else {
                console.table(historial);
            }
            break;
        }
        case "6": {
            const reporte = await comedorService.reporteBajoStock();
            if (reporte.length === 0) {
                mostrarInfo("No hay productos con stock bajo.");
            } else {
                console.log("\n⚠️ ALERTA DE STOCK BAJO:");
                console.table(reporte);
            }
            break;
        }
        case "7": {
            const reporte = await comedorService.reporteProximosVencer();
            if (reporte.length === 0) {
                mostrarInfo("No hay productos próximos a vencer.");
            } else {
                console.log("\n📅 PRODUCTOS PRÓXIMOS A VENCER (30 DÍAS):");
                console.table(reporte);
            }
            break;
        }
    }
}

async function ejecutarOpcionDonante(opcion: string, usuario: SesionUsuario) {
    switch (opcion) {
        case "1": {
            const descripcion = await validarInput("➤ Producto a donar: ", promesaValidation.descripcion);
            const cantidad = await validarInputFloat("➤ Cantidad: ");
            const unidad = await validarInput("➤ Unidad de medida: ", promesaValidation.unidadMedida);
            await comedorService.registrarPromesa({
                id_donante: usuario.id_donante || 1,
                descripcion_producto: descripcion,
                cantidad: cantidad,
                unidad_medida: unidad
            });
            mostrarExito("Promesa de donación registrada como pendiente.");
            break;
        }
        case "2": {
            const promesas = await comedorService.listarPromesasPorDonante(usuario.id_donante || 1);
            if (promesas.length === 0) {
                mostrarInfo("No tienes promesas registradas.");
            } else {
                console.log("\n📋 MIS PROMESAS DE DONACIÓN:");
                console.table(promesas);
            }
            break;
        }
    }
}