export interface MovimientoInventario {
  id_movimiento?: number;
  id_producto: number;
  id_personal: number;
  tipo_movimiento: "entrada" | "salida";
  cantidad: number;
  fecha_movimiento?: string;
  comentario?: string;
}