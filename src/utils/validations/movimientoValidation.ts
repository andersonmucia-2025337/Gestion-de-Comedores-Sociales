export const movimientoValidation = {
  id: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID debe ser un número entero positivo mayor que 0.";
    return null;
  },
  idProducto: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID del producto debe ser un número entero positivo mayor que 0.";
    return null;
  },
  idPersonal: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID del personal debe ser un número entero positivo mayor que 0.";
    return null;
  },
  tipo: (valor: string): string | null => {
    const trimmed = valor.trim().toLowerCase();
    if (!["entrada", "salida"].includes(trimmed)) {
      return "El tipo solo puede ser: entrada o salida.";
    }
    return null;
  },
  cantidad: (valor: string): string | null => {
    const num = parseFloat(valor);
    if (isNaN(num) || num <= 0) return "La cantidad debe ser un número positivo mayor que 0.";
    return null;
  },
  comentario: (valor: string): string | null => {
    if (valor && valor.length > 255) return "El comentario debe tener máximo 255 caracteres.";
    return null;
  }
};