export const donanteValidation = {
  id: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID debe ser un número entero positivo mayor que 0.";
    return null;
  },
  nombre: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "El nombre del donante es obligatorio.";
    if (trimmed.length < 3) return "El nombre debe tener mínimo 3 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) {
      return "El nombre solo debe contener letras y espacios.";
    }
    return null;
  },
  tipo: (valor: string): string | null => {
    const trimmed = valor.trim().toLowerCase();
    if (trimmed && !["particular", "empresa", "organización"].includes(trimmed)) {
      return "El tipo solo puede ser: particular, empresa u organización.";
    }
    return null;
  },
  telefono: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (trimmed && !/^[0-9]{8}$/.test(trimmed)) {
      return "El teléfono debe tener exactamente 8 dígitos numéricos.";
    }
    return null;
  },
  idLogin: (valor: string): string | null => {
    if (!valor.trim()) return null;
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID de login debe ser un número entero positivo mayor que 0.";
    return null;
  }
};