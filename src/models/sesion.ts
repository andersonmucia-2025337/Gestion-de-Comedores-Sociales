export interface SesionUsuario {
  id_login: number;
  usuario_login: string;
  correo_login: string;
  id_rol: number;
  nombre_rol: "admin" | "almacenista" | "donante";
  id_personal?: number | null;
  id_donante?: number | null;
}