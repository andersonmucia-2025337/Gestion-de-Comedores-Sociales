export const categoriaValidation = {
  id: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID debe ser un número entero positivo mayor que 0.";
    return null;
  },
  nombre: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "El nombre de categoría es obligatorio.";
    if (trimmed.length < 3) return "El nombre debe tener mínimo 3 caracteres.";
    if (trimmed.length > 50) return "El nombre debe tener máximo 50 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) {
      return "El nombre solo debe contener letras, espacios y tildes.";
    }
    return null;
  }
};