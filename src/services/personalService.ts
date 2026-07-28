import { pool } from "../data/db";
import { Personal } from "../models/personal";

export class PersonalService {
  validarCorreo(correo: string): boolean {
    const dominiosValidos = ["@gmail.com", "@yahoo.com", "@comedor.org"];
    return dominiosValidos.some(dominio => correo.toLowerCase().endsWith(dominio));
  }

  async existe(id: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_personal FROM personal WHERE id_personal = ?", [id]);
    return (rows as any[]).length > 0;
  }

  async existeRol(id: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_rol FROM roles WHERE id_rol = ?", [id]);
    return (rows as any[]).length > 0;
  }

  async agregar(p: Personal): Promise<void> {
    if (!this.validarCorreo(p.correo_login)) {
      throw new Error("Dominio de correo no permitido.");
    }
    if (!await this.existeRol(p.id_rol)) {
      throw new Error(`No existe un rol con ID ${p.id_rol}.`);
    }
    await pool.query("CALL sp_agregarpersonal(?, ?, ?, ?, ?, ?, ?)", [
      p.correo_login, p.usuario_login, p.contrasena_login, p.id_rol, 
      p.nombre_personal, p.apellido_personal, p.estado_personal
    ]);
  }

  async listar(): Promise<any[]> {
    const [rows] = await pool.query("CALL sp_listarpersonal()");
    return (rows as any[])[0];
  }

  async buscarPorId(id: number): Promise<Personal | null> {
    if (!await this.existe(id)) {
      return null;
    }
    const [rows] = await pool.query("CALL sp_buscarpersonalporid(?)", [id]);
    const r = (rows as any[])[0];
    return r && r.length > 0 ? r[0] : null;
  }

  async buscarPorIdConValidacion(id: number): Promise<Personal> {
    const personal = await this.buscarPorId(id);
    if (!personal) {
      throw new Error(`No existe personal con ID ${id}.`);
    }
    return personal;
  }

  async actualizar(id: number, datos: any): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe personal con ID ${id}.`);
    }
    await pool.query(
      "UPDATE personal SET nombre_personal = ?, apellido_personal = ?, estado_personal = ? WHERE id_personal = ?",
      [datos.nombre_personal, datos.apellido_personal, datos.estado_personal, id]
    );
  }

  async eliminar(id: number): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe personal con ID ${id}.`);
    }
    await pool.query("DELETE FROM personal WHERE id_personal = ?", [id]);
  }
}