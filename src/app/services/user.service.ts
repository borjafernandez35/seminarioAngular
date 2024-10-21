import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../models/user.model';
import {Experiencia} from '../models/experiencia.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = "http://localhost:3000/user";  // Usar apiUrl desde environment

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.apiUrl);
  }
  getUserById(id: string): Observable<IUser> {
    // Pasamos el ID del usuario en la URL para obtenerlo del backend
    return this.http.get<IUser>(`${this.apiUrl}/${id}`);
  }

  // Agregar un nuevo usuario
  addUser(usuario: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.apiUrl, usuario);
  }

  // Actualizar un usuario existente
  updateUser(usuario: IUser): Observable<IUser> {
    return this.http.put<IUser>(`${this.apiUrl}/${usuario._id}`, usuario);
  }

  // Eliminar un usuario por su _id
  deleteUserById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  getExperience(userId: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/experiences/${userId}`);
  }

  addExperience(usuario: Experiencia): Observable<Experiencia> {
    return this.http.post<Experiencia>(`${this.apiUrl}/add/${usuario.owner}/${usuario._id}`,usuario);
  }

  deleteExperience(userId: string, experienceId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/del/${userId}/${experienceId}`);
  }
}

  



