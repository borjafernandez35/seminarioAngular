export interface Experiencia {
  _id?: string;  // Propiedad opcional _id para el ID de la experiencia
  owner: string; // ID del propietario (usuario)
  participants: string[]; // Array de IDs de participantes
  description: string; // Descripción de la experiencia
}

  