import { pool } from "../data/db";
import { Categoria } from "../models/categoria";

export class CategoriaService {
  async existe(id: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_categoria FROM categorias WHERE id_categoria = ?", [id]);
    return (rows as any[]).length > 0;
  }

  async agregar(nombre: string): Promise<void> {
    const [existe] = await pool.query("SELECT id_categoria FROM categorias WHERE nombre_categoria = ?", [nombre]);
    if ((existe as any[]).length > 0) {
      throw new Error(`La categoría "${nombre}" ya existe.`);
    }
    await pool.query("CALL sp_agregarcategoria(?)", [nombre]);
  }

  async listar(): Promise<Categoria[]> {
    const [rows] = await pool.query("CALL sp_listarcategorias()");
    return (rows as any[])[0];
  }

  async buscarPorId(id: number): Promise<Categoria | null> {
    const [rows] = await pool.query("CALL sp_buscarcategoriaporid(?)", [id]);
    const r = (rows as any[])[0];
    return r && r.length > 0 ? r[0] : null;
  }

  async buscarPorIdConValidacion(id: number): Promise<Categoria> {
    const categoria = await this.buscarPorId(id);
    if (!categoria) {
      throw new Error(`No existe una categoría con ID ${id}.`);
    }
    return categoria;
  }

  async actualizar(id: number, nombre: string): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe una categoría con ID ${id}.`);
    }
    const [existe] = await pool.query(
      "SELECT id_categoria FROM categorias WHERE nombre_categoria = ? AND id_categoria != ?", 
      [nombre, id]
    );
    if ((existe as any[]).length > 0) {
      throw new Error(`Ya existe otra categoría con el nombre "${nombre}".`);
    }
    await pool.query("CALL sp_actualizarcategoria(?, ?)", [id, nombre]);
  }

  async eliminar(id: number): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe una categoría con ID ${id}.`);
    }
    const [productos] = await pool.query("SELECT id_producto FROM inventario WHERE id_categoria = ?", [id]);
    if ((productos as any[]).length > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene productos asociados.`);
    }
    await pool.query("CALL sp_eliminarcategoria(?)", [id]);
  }
}