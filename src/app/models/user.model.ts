export interface IUser {
  _id?: string;      // MongoDB genera automáticamente este campo al insertar
  name: string;
  mail: string;     // Añadir el campo email
  password: string;
  comment: string;    // Este campo es la "Biografía"
  experience?: string[];
}
  