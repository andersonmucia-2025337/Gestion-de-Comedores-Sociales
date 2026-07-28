import { pool } from "../data/db";

export class ReporteService {
  async bajoStock(): Promise<any[]> {
    const [rows] = await pool.query("CALL sp_reportebajostock()");
    return (rows as any[])[0];
  }

  async proximosVencer(): Promise<any[]> {
    const [rows] = await pool.query("CALL sp_reporteproximosvencer()");
    return (rows as any[])[0];
  }
}