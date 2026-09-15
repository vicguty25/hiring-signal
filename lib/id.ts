import { randomBytes } from "node:crypto";

const ALFABETO = "abcdefghijkmnpqrstuvwxyz23456789";

/** Slug del rol. Es la credencial: quien tiene el enlace, evalua. */
export function idRol(largo = 10): string {
  const bytes = randomBytes(largo);
  let salida = "";
  for (let i = 0; i < largo; i++) salida += ALFABETO[bytes[i]! % ALFABETO.length];
  return salida;
}

export function id(): string {
  return randomBytes(12).toString("hex");
}
