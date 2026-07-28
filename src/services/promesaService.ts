import { pool } from "../data/db";
import { PromesaDonacion } from "../models/promesa";
import { DonanteService } from "./donanteService";
import { ProductoService } from "./productoService";
import { PersonalService } from "./personalService";

const donanteService = new DonanteService();
const productoService = new ProductoService();
const personalService = new PersonalService();

export class PromesaService {
  async existe(id: number): Promise<boolean> {
    const [rows] = await pool.query("SELECT id_promesa FROM promesas_donacion WHERE id_promesa = ?", [id]);
    return (rows as any[]).length > 0;
  }

  async registrar(p: PromesaDonacion): Promise<void> {
    if (!await donanteService.existe(p.id_donante)) {
      throw new Error(`No existe un donante con ID ${p.id_donante}.`);
    }
    await pool.query("CALL sp_crearpromesadonacion(?, ?, ?, ?)", [
      p.id_donante, p.descripcion_producto, p.cantidad, p.unidad_medida
    ]);
  }

  async listarPorDonante(idDonante: number): Promise<PromesaDonacion[]> {
    if (!await donanteService.existe(idDonante)) {
      throw new Error(`No existe un donante con ID ${idDonante}.`);
    }
    const [rows] = await pool.query("CALL sp_listarpromesaspordonante(?)", [idDonante]);
    return (rows as any[])[0];
  }

  async listarTodas(): Promise<PromesaDonacion[]> {
    const [rows] = await pool.query("SELECT * FROM promesas_donacion ORDER BY fecha_promesa DESC");
    return rows as PromesaDonacion[];
  }

  async buscarPorId(id: number): Promise<PromesaDonacion | null> {
    const [rows] = await pool.query("SELECT * FROM promesas_donacion WHERE id_promesa = ?", [id]);
    return (rows as any[])[0] || null;
  }

  async buscarPorIdConValidacion(id: number): Promise<PromesaDonacion> {
    const promesa = await this.buscarPorId(id);
    if (!promesa) {
      throw new Error(`No existe una promesa con ID ${id}.`);
    }
    return promesa;
  }

  async actualizar(id: number, datos: any): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe una promesa con ID ${id}.`);
    }
    await pool.query(
      "UPDATE promesas_donacion SET estado = ? WHERE id_promesa = ?",
      [datos.estado, id]
    );
  }

  async eliminar(id: number): Promise<void> {
    if (!await this.existe(id)) {
      throw new Error(`No existe una promesa con ID ${id}.`);
    }
    await pool.query("DELETE FROM promesas_donacion WHERE id_promesa = ?", [id]);
  }

  async procesar(
    idPromesa: number, 
    idProducto: number, 
    idPersonal: number, 
    estado: "recibida" | "rechazada"
  ): Promise<void> {
    if (!await this.existe(idPromesa)) {
      throw new Error(`No existe una promesa con ID ${idPromesa}.`);
    }
    if (!await productoService.existe(idProducto)) {
      throw new Error(`No existe un producto con ID ${idProducto}.`);
    }
    if (!await personalService.existe(idPersonal)) {
      throw new Error(`No existe personal con ID ${idPersonal}.`);
    }
    
    await pool.query("CALL sp_procesarpromesadonacion(?, ?, ?, ?)", [
      idPromesa, idProducto, idPersonal, estado
    ]);
  }
}