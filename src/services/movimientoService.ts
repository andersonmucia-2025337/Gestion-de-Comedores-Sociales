// services/movimientoService.ts
import { pool } from "../data/db";
import { MovimientoInventario } from "../models/movimiento";
import { ProductoService } from "./productoService";
import { PersonalService } from "./personalService";

const productoService = new ProductoService();
const personalService = new PersonalService();

export class MovimientoService {
  async existe(id: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_movimiento FROM movimientosinventario WHERE id_movimiento = ?", [id]);
    return (rows as any[]).length > 0;
  }

  async registrar(m: MovimientoInventario): Promise<void> {
    if (!await productoService.existe(m.id_producto)) {
      throw new Error(`No existe un producto con ID ${m.id_producto}.`);
    }
    if (!await personalService.existe(m.id_personal)) {
      throw new Error(`No existe personal con ID ${m.id_personal}.`);
    }
    
    if (m.tipo_movimiento === "salida") {
      const stockActual = await productoService.obtenerStock(m.id_producto);
      if (stockActual < m.cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${stockActual}, solicitado: ${m.cantidad}`);
      }
    }
    
    await pool.query("CALL sp_registrarmovimiento(?, ?, ?, ?, ?)", [
      m.id_producto, m.id_personal, m.tipo_movimiento, m.cantidad, m.comentario || null
    ]);
  }

  async listarHistorial(): Promise<any[]> {
    const [rows] = await pool.query("CALL sp_historialmovimientos()");
    return (rows as any[])[0];
  }

  async buscarPorId(id: number): Promise<any | null> {
    const [rows] = await pool.query("SELECT * FROM movimientosinventario WHERE id_movimiento = ?", [id]);
    return (rows as any[])[0] || null;
  }

  async buscarPorIdConValidacion(id: number): Promise<any> {
    const movimiento = await this.buscarPorId(id);
    if (!movimiento) {
      throw new Error(`No existe un movimiento con ID ${id}.`);
    }
    return movimiento;
  }

  async actualizar(id: number, comentario: string): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe un movimiento con ID ${id}.`);
    }
    await pool.query(
      "UPDATE movimientosinventario SET comentario = ? WHERE id_movimiento = ?",
      [comentario, id]
    );
  }

  async eliminar(id: number): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe un movimiento con ID ${id}.`);
    }
    await pool.query("DELETE FROM movimientosinventario WHERE id_movimiento = ?", [id]);
  }
}