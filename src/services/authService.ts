import { pool } from "../data/db";
import { SesionUsuario } from "../models/sesion";

export class AuthService {
  validarCorreo(correo: string): boolean {
    const dominiosValidos = ["@gmail.com", "@yahoo.com", "@comedor.org"];
    return dominiosValidos.some(dominio => correo.toLowerCase().endsWith(dominio));
  }

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
}