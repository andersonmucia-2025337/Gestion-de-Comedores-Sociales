export const promesaValidation = {
  id: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID debe ser un número entero positivo mayor que 0.";
    return null;
  },
  idDonante: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID del donante debe ser un número entero positivo mayor que 0.";
    return null;
  },
  descripcion: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "La descripción del producto es obligatoria.";
    if (trimmed.length < 5) return "La descripción debe tener mínimo 5 caracteres.";
    if (trimmed.length > 200) return "La descripción debe tener máximo 200 caracteres.";
    return null;
  },
  cantidad: (valor: string): string | null => {
    const num = parseFloat(valor);
    if (isNaN(num) || num <= 0) return "La cantidad debe ser un número positivo mayor que 0.";
    return null;
  },
  unidadMedida: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "La unidad de medida es obligatoria.";
    const unidadesValidas = ["kg", "libra", "litro", "unidad", "paquete"];
    if (!unidadesValidas.includes(trimmed.toLowerCase())) {
      return `Unidad inválida. Use: ${unidadesValidas.join(", ")}`;
    }
    return null;
  },
  estado: (valor: string): string | null => {
    const trimmed = valor.trim().toLowerCase();
    if (trimmed && !["pendiente", "recibida", "rechazada"].includes(trimmed)) {
      return "El estado solo puede ser: pendiente, recibida o rechazada.";
    }
    return null;
  },
  fechaPromesa: (valor: string): string | null => {
    if (!valor.trim()) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) return "Formato inválido. Use YYYY-MM-DD.";
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return "Fecha inválida.";
    return null;
  }
};