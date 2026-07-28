import { pool } from "../data/db";
import { Producto } from "../models/producto";
import { CategoriaService } from "./categoriaService";

const categoriaService = new CategoriaService();

export class ProductoService {
  async existe(id: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_producto FROM inventario WHERE id_producto = ?", [id]);
    return (rows as any[]).length > 0;
  }

  async existeMovimientoConProducto(idProducto: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_movimiento FROM movimientosinventario WHERE id_producto = ?", [idProducto]);
    return (rows as any[]).length > 0;
  }

  async agregar(p: Producto): Promise<void> {
    if (!await categoriaService.existe(p.id_categoria)) {
      throw new Error(`No existe una categoría con ID ${p.id_categoria}.`);
    }
    await pool.query("CALL sp_agregarproducto(?, ?, ?, ?, ?)", [
      p.id_categoria, p.nombre_producto, p.unidad_medida, p.stock_minimo, p.fecha_vencimiento
    ]);
  }

  async listar(): Promise<Producto[]> {
    const [rows] = await pool.query("CALL sp_listarinventario()");
    return (rows as any[])[0];
  }

  async buscarPorId(id: number): Promise<Producto | null> {
    const [rows] = await pool.query("CALL sp_buscarproductoporid(?)", [id]);
    const r = (rows as any[])[0];
    return r && r.length > 0 ? r[0] : null;
  }

  async buscarPorIdConValidacion(id: number): Promise<Producto> {
    const producto = await this.buscarPorId(id);
    if (!producto) {
      throw new Error(`No existe un producto con ID ${id}.`);
    }
    return producto;
  }

  async actualizar(id: number, nombre: string, minimo: number, vencimiento: string): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe un producto con ID ${id}.`);
    }
    await pool.query("CALL sp_actualizarproducto(?, ?, ?, ?)", [id, nombre, minimo, vencimiento]);
  }

  async eliminar(id: number): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe un producto con ID ${id}.`);
    }
    if (await this.existeMovimientoConProducto(id)) {
      throw new Error(`No se puede eliminar el producto porque tiene movimientos asociados.`);
    }
    await pool.query("CALL sp_eliminarproducto(?)", [id]);
  }

  async obtenerStock(id: number): Promise<number> {
    const [stock] = await pool.query(
      "SELECT cantidad_actual FROM inventario WHERE id_producto = ?", 
      [id]
    );
    return (stock as any[])[0]?.cantidad_actual || 0;
  }
}