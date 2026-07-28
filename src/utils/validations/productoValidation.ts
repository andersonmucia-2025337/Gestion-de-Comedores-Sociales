export const productoValidation = {
  id: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID debe ser un número entero positivo mayor que 0.";
    return null;
  },
  idCategoria: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID de categoría debe ser un número entero positivo mayor que 0.";
    return null;
  },
  nombre: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "El nombre del producto es obligatorio.";
    if (trimmed.length < 2) return "El nombre debe tener mínimo 2 caracteres.";
    if (trimmed.length > 100) return "El nombre debe tener máximo 100 caracteres.";
    return null;
  },
  cantidadActual: (valor: string): string | null => {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0) return "La cantidad actual debe ser un número mayor o igual a 0.";
    return null;
  },
  unidadMedida: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "La unidad de medida es obligatoria.";
    if (trimmed.length > 20) return "La unidad de medida debe tener máximo 20 caracteres.";
    const unidadesValidas = ["kg", "libra", "litro", "unidad", "paquete"];
    if (!unidadesValidas.includes(trimmed.toLowerCase())) {
      return `Unidad inválida. Use: ${unidadesValidas.join(", ")}`;
    }
    return null;
  },
  stockMinimo: (valor: string): string | null => {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0) return "El stock mínimo debe ser un número mayor o igual a 0.";
    return null;
  },
  fechaVencimiento: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "La fecha de vencimiento es obligatoria.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "Formato inválido. Use YYYY-MM-DD.";
    const fecha = new Date(trimmed);
    if (isNaN(fecha.getTime())) return "Fecha inválida.";
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fecha < hoy) return "La fecha no puede ser anterior al día actual.";
    return null;
  }
};