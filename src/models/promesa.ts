export interface PromesaDonacion {
  id_promesa?: number;
  id_donante: number;
  descripcion_producto: string;
  cantidad: number;
  unidad_medida: string;
  estado?: "pendiente" | "recibida" | "rechazada";
  fecha_promesa?: string;
}