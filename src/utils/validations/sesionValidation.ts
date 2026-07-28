export const sesionValidation = {
  idLogin: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID de login debe ser un número entero positivo mayor que 0.";
    return null;
  },
  usuario: (valor: string): string | null => {
    const trimmed = valor.trim();
    if (!trimmed) return "El usuario es obligatorio.";
    if (trimmed.length < 4) return "El usuario debe tener mínimo 4 caracteres.";
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return "El usuario solo puede contener letras, números y guión bajo.";
    }
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
  idRol: (valor: string): string | null => {
    const num = parseInt(valor);
    if (isNaN(num) || ![1, 2, 3].includes(num)) {
      return "El ID de rol debe ser: 1 (admin), 2 (almacenista), 3 (donante).";
    }
    return null;
  },
  nombreRol: (valor: string): string | null => {
    const trimmed = valor.trim().toLowerCase();
    if (!["admin", "almacenista", "donante"].includes(trimmed)) {
      return "El rol solo puede ser: admin, almacenista o donante.";
    }
    return null;
  },
  idPersonal: (valor: string): string | null => {
    if (!valor.trim()) return null;
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID de personal debe ser un número entero positivo mayor que 0.";
    return null;
  },
  idDonante: (valor: string): string | null => {
    if (!valor.trim()) return null;
    const num = parseInt(valor);
    if (isNaN(num) || num <= 0) return "El ID de donante debe ser un número entero positivo mayor que 0.";
    return null;
  }
};