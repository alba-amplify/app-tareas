// Lista de departamentos del equipo Amplify (para los desplegables).
export const DEPARTMENTS = [
  "Dirección",
  "Estrategia",
  "Equipo Comercial",
  "Equipo Publicidad",
  "Equipo Diseño",
  "Equipo Desarrollo",
  "Equipo Contenidos",
];

// Devuelve la lista de opciones incluyendo un valor actual "heredado"
// que no esté en la lista (para no perder datos antiguos).
export function departmentOptions(current: string | null | undefined) {
  if (current && !DEPARTMENTS.includes(current)) return [current, ...DEPARTMENTS];
  return DEPARTMENTS;
}
