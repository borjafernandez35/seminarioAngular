import { Component, OnInit } from '@angular/core';
import { ExperienciaService } from '../../services/experiencia.service';
import { Experiencia } from '../../models/experiencia.model';
import { UserService } from '../../services/user.service';
import { IUser } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-experiencia',
  templateUrl: './experiencia.component.html',
  standalone: true,
  styleUrls: ['./experiencia.component.css'],
  imports: [FormsModule, CommonModule, HttpClientModule, TruncatePipe]
})
export class ExperienciaComponent implements OnInit {
  experiencias: Experiencia[] = []; // Lista de experiencias
  users: IUser[] = []; // Lista de usuarios para los desplegables
  selectedParticipants: string[] = []; // Participantes seleccionados como ObjectId
  errorMessage: string = ''; // Variable para mostrar mensajes de error
  successMessage: string = '';

  // Estructura inicial para una nueva experiencia
  newExperience: Experiencia = {
    owner: '',
    participants: [],
    description: ''
  };

  constructor(private experienciaService: ExperienciaService, private userService: UserService) {}

  ngOnInit(): void {
    this.getExperiencias(); // Obtener la lista de experiencias
    this.getUsers(); // Obtener la lista de usuarios
    //this.addExperience(this.newExperience);

  }

  // Obtener la lista de experiencias desde la API
  getExperiencias(): void {
    this.experienciaService.getExperiencias().subscribe(
      (data: Experiencia[]) => {
        // Filtrar experiencias que tengan _id definido
        this.experiencias = data.filter(exp => exp._id !== undefined);
        console.log('Experiencias recibidas:', data);
      },
      (error) => {
        console.error('Error al obtener las experiencias:', error);
      }
    );
  }
   addExperience(experience: Experiencia): void {
    this.userService.addExperience(experience).subscribe(
      () => {
        console.log(`Experience: ${experience} añadida`);
        this.getUsers(); // Actualizar la lista de experiencias después de la eliminación
      },
      (error) => {
        console.error('Error al añadir experience:', error);
      }
    );
  } 

  // Obtener la lista de usuarios desde la API
  getUsers(): void {
    this.userService.getUsers().subscribe(
      (data: IUser[]) => {
        this.users = data;
        console.log('Usuarios recibidos:', data);
      },
      (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }

  // Obtener el nombre de un usuario dado su ObjectId
  getUserNameById(userId: string): string {
    const user = this.users.find((u) => u._id === userId);
    return user ? user.name : 'Desconocido';
  }
  async addExperienceToUser(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
  
    // Validación de campos
    if (!this.newExperience.owner || this.selectedParticipants.length === 0 || !this.newExperience.description) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }
  
    // Asignar los participantes seleccionados a la experiencia
    this.newExperience.participants = this.selectedParticipants;
  
    try {
      // Crear la nueva experiencia en el servicio de experiencias (sin _id aún)
      const createdExperience = await this.experienciaService.addExperiencia(this.newExperience).toPromise();
      console.log('Experiencia añadida:', createdExperience);

      if (!createdExperience) {
        throw new Error('La experiencia creada es indefinida.');
      }
      
      console.log('Experiencia añadida:', createdExperience);
  
      // Ahora que tenemos el _id de la experiencia creada, asociarla con el usuario propietario
      await this.userService.addExperience(createdExperience).toPromise();
      console.log('Experiencia asociada con éxito al usuario.');
  
      // Actualizar la lista de experiencias en la interfaz
      this.getExperiencias();
  
      this.successMessage = 'Experiencia añadida con éxito al usuario.';
      this.resetForm();  // Limpiar el formulario
    } catch (error) {
      console.error('Error al añadir la experiencia:', error);
      this.errorMessage = 'Hubo un problema al añadir la experiencia.';
    }
  }
  

  // Método para eliminar una experiencia por su ID
  deleteExperience(experienceId: string): void {
    this.experienciaService.deleteExperiencia(experienceId).subscribe(
      () => {
        console.log(`Experiencia con ID ${experienceId} eliminada`);
        this.getExperiencias(); // Actualizar la lista de experiencias después de la eliminación
      },
      (error) => {
        console.error('Error al eliminar la experiencia:', error);
      }
    );
  }



  // Resetear el formulario después de crear una experiencia
  resetForm(): void {
    this.newExperience = {
      owner: '',
      participants: [],
      description: ''
    };
    this.selectedParticipants = []; // Limpiar los participantes seleccionados
    this.errorMessage = ''; // Limpiar el mensaje de error
  }
}
