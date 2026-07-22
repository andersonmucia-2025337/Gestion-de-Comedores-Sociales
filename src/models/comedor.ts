export interface Categoria {
  id_categoria?: number;
  nombre_categoria: string;
}

export interface Producto {
  id_producto?: number;
  id_categoria: number;
  nombre_producto: string;
  cantidad_actual?: number;
  unidad_medida: string;
  stock_minimo?: number;
  fecha_vencimiento: string;
}

export interface Personal {
  id_personal?: number;
  correo_login: string;
  usuario_login: string;
  contrasena_login: string;
  id_rol: number;
  nombre_personal: string;
  apellido_personal: string;
  estado_personal: string;
}

export interface Donante {
  id_donante?: number;
  nombre_donante: string;
  tipo_donante?: string;
  telefono_donante?: string;
  id_login?: number;
}

export interface MovimientoInventario {
  id_producto: number;
  id_personal: number;
  tipo_movimiento: "entrada" | "salida";
  cantidad: number;
  comentario?: string;
}

export interface PromesaDonacion {
  id_promesa?: number;
  id_donante: number;
  descripcion_producto: string;
  cantidad: number;
  unidad_medida: string;
  estado?: "pendiente" | "recibida" | "rechazada";
  fecha_promesa?: string;
}

export interface SesionUsuario {
  id_login: number;
  usuario_login: string;
  correo_login: string;
  id_rol: number;
  nombre_rol: "admin" | "almacenista" | "donante";
  id_personal?: number | null;
  id_donante?: number | null;
}
