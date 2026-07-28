export const personalValidation = {
  id: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID debe ser un número entero positivo mayor que 0.";
    return null;
  },
  correo: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "El correo es obligatorio.";
    const dominiosValidos = ["@gmail.com", "@yahoo.com", "@comedor.org"];
    if (!dominiosValidos.some(d => trimmed.toLowerCase().endsWith(d))) {
      return `El correo debe usar: ${dominiosValidos.join(", ")}`;
    }
    return null;
  },
  usuario: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "El usuario es obligatorio.";
    if (trimmed.length < 4) return "El usuario debe tener mínimo 4 caracteres.";
    if (trimmed.length > 20) return "El usuario debe tener máximo 20 caracteres.";
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return "El usuario solo puede contener letras, números y guión bajo.";
    }
    return null;
  },
  contrasena: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "La contraseña es obligatoria.";
    if (trimmed.length < 8) return "La contraseña debe tener mínimo 8 caracteres.";
    if (!/[A-Z]/.test(trimmed)) return "La contraseña debe tener al menos una mayúscula.";
    if (!/[a-z]/.test(trimmed)) return "La contraseña debe tener al menos una minúscula.";
    if (!/[0-9]/.test(trimmed)) return "La contraseña debe tener al menos un número.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmed)) {
      return "La contraseña debe tener al menos un carácter especial.";
    }
    return null;
  },
  idRol: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num)) return "El ID de rol debe ser un número entero.";
    if (![1, 2, 3].includes(num)) return "El rol solo puede ser: 1 (admin), 2 (almacenista), 3 (donante).";
    return null;
  },
  nombre: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "El nombre es obligatorio.";
    if (trimmed.length < 2) return "El nombre debe tener mínimo 2 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) {
      return "El nombre solo debe contener letras y espacios.";
    }
    return null;
  },
  apellido: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "El apellido es obligatorio.";
    if (trimmed.length < 2) return "El apellido debe tener mínimo 2 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) {
      return "El apellido solo debe contener letras y espacios.";
    }
    return null;
  },
  estado: (valor: string): string | null => {
    const trimmed = valor.trim().toLowerCase();
    if (!["activo", "inactivo", "suspendido"].includes(trimmed)) {
      return "El estado solo puede ser: activo, inactivo o suspendido.";
    }
    return null;
  }
};