export { categoriaValidation } from "./categoriaValidation";
export { productoValidation } from "./productoValidation";
export { personalValidation } from "./personalValidation";
export { donanteValidation } from "./donanteValidation";
export { movimientoValidation } from "./movimientoValidation";
export { promesaValidation } from "./promesaValidation";
export { sesionValidation } from "./sesionValidation";

export const generalValidation = {
  textoNoVacio: (valor: string): string | null => {
    if (!valor.trim()) return "El campo no puede estar vacío.";
    return null;
  },
  numeroPositivo: (valor: string): string | null => {
    const num = parseFloat(valor);
    if (isNaN(num) || num <= 0) return "Debe ser un número positivo mayor que 0.";
    return null;
  },
  numeroEnteroPositivo: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "Debe ser un número entero positivo mayor que 0.";
    return null;
  }
};

export type Validador = (valor: string) => string | null;