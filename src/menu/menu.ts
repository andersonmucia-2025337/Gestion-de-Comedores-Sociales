import { pool } from "../data/db.js";
import { Categoria, Producto, Personal, Donante, MovimientoInventario, PromesaDonacion, SesionUsuario } from "../models/comedor.js";

class ComedorService {
  
  validarCorreo(correo: string): boolean {
    const dominiosValidos = ["@gmail.com", "@yahoo.com", "@comedor.org"];
    return dominiosValidos.some(dominio => correo.toLowerCase().endsWith(dominio));
  }

  // --- AUTENTICACIÓN Y LOGIN ---
  async iniciarSesion(usuario: string, contrasena: string): Promise<SesionUsuario | null> {
    const [rows] = await pool.query("CALL sp_autenticarusuario(?, ?)", [usuario, contrasena]);
    const lista = (rows as any[])[0];
    return lista && lista.length > 0 ? lista[0] : null;
  }

  async registrarUsuarioHibrido(datos: {
    correo: string;
    usuario: string;
    contrasena: string;
    rol: "admin" | "almacenista" | "donante";
    nombre: string;
    apellido: string;
  }): Promise<void> {
    if (!this.validarCorreo(datos.correo)) {
      throw new Error("El correo no pertenece a un dominio permitido (@gmail.com, @yahoo.com, @comedor.org).");
    }

    let id_rol = 3; 
    if (datos.rol === "admin") id_rol = 1;
    if (datos.rol === "almacenista") id_rol = 2;

    if (datos.rol === "admin" || datos.rol === "almacenista") {
      await pool.query("CALL sp_agregarpersonal(?, ?, ?, ?, ?, ?, ?)", [
        datos.correo, datos.usuario, datos.contrasena, id_rol, datos.nombre, datos.apellido, "activo"
      ]);
    } else {
      const [resLogin] = await pool.query(
        "INSERT INTO login (correo_login, usuario_login, contrasena_login, id_rol) VALUES (?, ?, ?, ?)",
        [datos.correo, datos.usuario, datos.contrasena, id_rol]
      );
      const insertId = (resLogin as any).insertId;
      await pool.query(
        "INSERT INTO donantes (nombre_donante, tipo_donante, telefono_donante, id_login) VALUES (?, ?, ?, ?)",
        [datos.nombre + " " + datos.apellido, "particular", "00000000", insertId]
      );
    }
  }

  // --- CATEGORÍAS ---
  async agregarCategoria(nombre: string): Promise<void> {
    await pool.query("CALL sp_agregarcategoria(?)", [nombre]);
  }

  async listarCategorias(): Promise<Categoria[]> {
    const [rows] = await pool.query("CALL sp_listarcategorias()");
    return (rows as any[])[0]; 
  }

  async buscarCategoriaPorId(id: number): Promise<Categoria | null> {
    const [rows] = await pool.query("CALL sp_buscarcategoriaporid(?)", [id]);
    const r = (rows as any[])[0];
    return r && r.length > 0 ? r[0] : null;
  }

  async actualizarCategoria(id: number, nombre: string): Promise<void> {
    await pool.query("CALL sp_actualizarcategoria(?, ?)", [id, nombre]);
  }

  async eliminarCategoria(id: number): Promise<void> {
    await pool.query("CALL sp_eliminarcategoria(?)", [id]);
  }

  // --- INVENTARIO ---
  async agregarProducto(p: Producto): Promise<void> {
    await pool.query("CALL sp_agregarproducto(?, ?, ?, ?, ?)", [
      p.id_categoria, p.nombre_producto, p.unidad_medida, p.stock_minimo, p.fecha_vencimiento
    ]);
  }

  async listarInventario(): Promise<Producto[]> {
    const [rows] = await pool.query("CALL sp_listarinventario()");
    return (rows as any[])[0];
  }

  async buscarProductoPorId(id: number): Promise<Producto | null> {
    const [rows] = await pool.query("CALL sp_obtenerproductoporid(?)", [id]);
    const r = (rows as any[])[0];
    return r && r.length > 0 ? r[0] : null;
  }

  async actualizarProducto(id: number, nombre: string, minimo: number, vencimiento: string): Promise<void> {
    await pool.query("CALL sp_actualizarproducto(?, ?, ?, ?)", [id, nombre, minimo, vencimiento]);
  }

  async eliminarProducto(id: number): Promise<void> {
    await pool.query("CALL sp_eliminarproducto(?)", [id]);
  }

  // --- MÉTODOS COMPATIBLES PARA MENU.TS ---
  async agregarPersonal(p: Personal): Promise<void> {
    if (!this.validarCorreo(p.correo_login)) {
      throw new Error("Dominio de correo no permitido.");
    }
    await pool.query("CALL sp_agregarpersonal(?, ?, ?, ?, ?, ?, ?)", [
      p.correo_login, p.usuario_login, p.contrasena_login, p.id_rol, p.nombre_personal, p.apellido_personal, p.estado_personal
    ]);
  }

  async listarPersonal(): Promise<any[]> {
    const [rows] = await pool.query("CALL sp_listarpersonal()");
    return (rows as any[])[0];
  }

  async buscarPersonalPorId(id: number): Promise<Personal | null> {
    const [rows] = await pool.query("CALL sp_buscarpersonalporid(?)", [id]);
    const r = (rows as any[])[0];
    return r && r.length > 0 ? r[0] : null;
  }

  // --- REPORTES ANALÍTICOS ---
  async reporteBajoStock(): Promise<any[]> {
    const [rows] = await pool.query("CALL sp_reportebajostock()");
    return (rows as any[])[0];
  }

  async reporteProximosVencer(): Promise<any[]> {
    const [rows] = await pool.query("CALL sp_reporteproximosvencer()");
    return (rows as any[])[0];
  }

  async listarHistorialMovimientos(): Promise<any[]> {
    const [rows] = await pool.query("CALL sp_historialmovimientos()");
    return (rows as any[])[0];
  }

  // --- PROMESAS DE DONACIÓN ---
  async registrarPromesa(p: PromesaDonacion): Promise<void> {
    await pool.query("CALL sp_crearpromesadonacion(?, ?, ?, ?)", [
      p.id_donante, p.descripcion_producto, p.cantidad, p.unidad_medida
    ]);
  }

  async listarPromesasPorDonante(idDonante: number): Promise<PromesaDonacion[]> {
    const [rows] = await pool.query("CALL sp_listarpromesaspordonante(?)", [idDonante]);
    return (rows as any[])[0];
  }

  // --- MOVIMIENTOS ---
  async registrarMovimiento(m: MovimientoInventario): Promise<void> {
    await pool.query("CALL sp_registrarmovimiento(?, ?, ?, ?, ?)", [
      m.id_producto, m.id_personal, m.tipo_movimiento, m.cantidad, m.comentario || null
    ]);
  }
}

export const comedorService = new ComedorService();
