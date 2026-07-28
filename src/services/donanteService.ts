import { pool } from "../data/db";
import { Donante } from "../models/donante";

export class DonanteService {
  async existe(id: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_donante FROM donantes WHERE id_donante = ?", [id]);
    return (rows as any[]).length > 0;
  }

  async existePromesaConDonante(idDonante: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_promesa FROM promesas_donacion WHERE id_donante = ?", [idDonante]);
    return (rows as any[]).length > 0;
  }

  async listar(): Promise<Donante[]> {
    const [rows] = await pool.query("CALL sp_listardonantes()");
    return (rows as any[])[0];
  }

  async buscarPorId(id: number): Promise<Donante | null> {
    const [rows] = await pool.query("SELECT * FROM donantes WHERE id_donante = ?", [id]);
    return (rows as any[])[0] || null;
  }

  async buscarPorIdConValidacion(id: number): Promise<Donante> {
    const donante = await this.buscarPorId(id);
    if (!donante) {
      throw new Error(`No existe un donante con ID ${id}.`);
    }
    return donante;
  }

  async agregar(datos: any): Promise<void> {
    await pool.query(
      "INSERT INTO donantes (nombre_donante, tipo_donante, telefono_donante, id_login) VALUES (?, ?, ?, ?)",
      [datos.nombre_donante, datos.tipo_donante || null, datos.telefono_donante || null, datos.id_login || null]
    );
  }

  async actualizar(id: number, datos: any): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe un donante con ID ${id}.`);
    }
    await pool.query(
      "UPDATE donantes SET nombre_donante = ?, tipo_donante = ?, telefono_donante = ? WHERE id_donante = ?",
      [datos.nombre_donante, datos.tipo_donante || null, datos.telefono_donante || null, id]
    );
  }

  async eliminar(id: number): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe un donante con ID ${id}.`);
    }
    if (await this.existePromesaConDonante(id)) {
      throw new Error(`No se puede eliminar el donante porque tiene promesas asociadas.`);
    }
    await pool.query("DELETE FROM donantes WHERE id_donante = ?", [id]);
  }
}