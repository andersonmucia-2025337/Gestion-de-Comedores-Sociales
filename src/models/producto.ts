export interface Producto {
  id_producto?: number;
  id_categoria: number;
  nombre_producto: string;
  cantidad_actual?: number;
  unidad_medida: string;
  stock_minimo?: number;
  fecha_vencimiento: string;
}