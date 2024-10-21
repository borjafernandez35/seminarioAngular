import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';  // Import FormsModule y NgForm para manejar el formulario
import { IUser } from '../../models/user.model'; // Importar el modelo User desde la subcarpeta services
import { UserService } from '../../services/user.service'; // Importar el servicio UserService desde la subcarpeta services
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { MaskEmailPipe } from '../../pipes/maskEmail.pipe';


@Component({
  selector: 'app-usuaris',
  templateUrl: './usuaris.component.html',
  styleUrls: ['./usuaris.component.css'],
  standalone: true,  // Esto convierte el componente en independiente
  imports: [CommonModule, FormsModule, TruncatePipe, MaskEmailPipe]  // Importar CommonModule y FormsModule

})
export class UsuarisComponent implements OnInit {
  usuarios: IUser[] = []; // Lista de usuarios con tipado User
  experiencias: string[][] = [];
  desplegado: boolean[] = []; // Controla si el desplegable de cada usuario está abierto o cerrado
  desplegarBiografia: boolean[] = [];
  mostrarPassword: boolean[] = []; // Array para controlar la visibilidad de la contraseña
  experienciasId: string | undefined;
  experienciasParticipants: string[][]=[];

  nuevoUsuario: IUser = {
    name: '',
    mail: '', // Añadir el campo email
    password: '',
    comment: '',
    experience:[]
  };

  confirmarPassword: string = ''; // Campo para confirmar la contraseña
  usuarioEdicion: IUser | null = null; // Usuario en proceso de edición
  indiceEdicion: number | null = null; // Almacena el índice del usuario en edición
  formSubmitted: boolean = false; // Indica si se ha enviado el formulario
  experiencEdition:string[] | undefined ;
  loadingExperiences: boolean[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Cargar usuarios desde el UserService
    this.userService.getUsers()
      .subscribe(data => {
        this.usuarios = data;
        this.desplegado = new Array(data.length).fill(false);
        this.loadingExperiences = new Array(data.length).fill(false);

        
        
      });
  }


   // Método para cargar las experiencias de un usuario
   loadExperiences(userId: string | undefined, index: number): void {
    if (!userId) {
      console.error('User ID es undefined, no se puede cargar la experiencia.');
      return;
    }
  
    if (this.loadingExperiences[index]) return; // Evitar múltiples cargas
  
    this.loadingExperiences[index] = true; // Activar bandera de carga
  
    this.userService.getExperience(userId).subscribe({
      next: (data) => {
        this.usuarios[index].experience= data.experience ? data.experience : [];
          // Procesamos cada experiencia para obtener los participantes
      const experiencePromises = this.usuarios[index].experience.map((exp: any) => {
        // Mapear los IDs de los participantes a sus nombres haciendo llamadas adicionales al servicio
        const participantNamesPromises = exp.participants.map((participantId: string) =>
          this.userService.getUserById(participantId).toPromise()
        );

        // Esperar a que todos los nombres de los participantes sean cargados
        return Promise.all(participantNamesPromises).then((participants: IUser[]) => {
          const participantNames = participants.map(p => p.name).join(', ');
          return `${exp._id} - ${exp.description} (${participantNames})`;
        });
      });

      // Esperar a que todas las promesas de experiencias sean resueltas
      Promise.all(experiencePromises).then((experiencesWithNames) => {
        this.experiencias[index] = experiencesWithNames;
      });
      },
      error: (error) => {
        console.error('Error al cargar experiencias:', error);
        this.experiencias[index] = [];
      },
      complete: () => {
        this.loadingExperiences[index] = false; // Desactivar bandera de carga al terminar
      }
    });
  }
  
  
  

  // Función para agregar o modificar un usuario
  agregarElemento(userForm: NgForm): void {
    this.formSubmitted = true;
  
    // Verificar si las contraseñas coinciden
    if (this.nuevoUsuario.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }
  
    if (this.indiceEdicion !== null) {
      // Estamos en modo edición, modificar el usuario existente
      this.usuarios[this.indiceEdicion] = { ...this.nuevoUsuario, _id: this.usuarios[this.indiceEdicion]._id };
  
      // Actualizar el usuario en la API
      this.userService.updateUser(this.usuarios[this.indiceEdicion]).subscribe(response => {
        console.log('Usuario actualizado:', response);
      });
  
      // Limpiar el estado de edición
      this.indiceEdicion = null;
    } else {
      // Modo agregar nuevo usuario
      const usuarioJSON: IUser = {
        name: this.nuevoUsuario.name,
        mail: this.nuevoUsuario.mail,
        password: this.nuevoUsuario.password,
        comment: this.nuevoUsuario.comment
      };
  
      // Enviar el usuario a la API a través del UserService
      this.userService.addUser(usuarioJSON).subscribe(response => {
        console.log('Usuario agregado:', response);
        
        // Agregar el usuario con el _id generado por la API al array de usuarios en el frontend
        this.usuarios.push({ ...usuarioJSON, _id: response._id });
        this.desplegado.push(false); // Añadir un nuevo estado de desplegado
      });
    }
  
    // Limpiar los campos del formulario y restablecer su estado
    this.resetForm(userForm);
  }
  

  // Función para limpiar el formulario
  resetForm(userForm: NgForm): void { // Aceptar userForm como parámetro
    this.nuevoUsuario = {
      name: '',
      mail: '', // Limpiar el campo email
      password: '',
      comment: ''
    };
    this.confirmarPassword = ''; // Reiniciar el campo de confirmar contraseña
    this.formSubmitted = false; // Restablecer el estado del formulario para no mostrar errores
    userForm.resetForm(); // Reiniciar el formulario en la vista
  }

  // Función para preparar la edición de un usuario
  prepararEdicion(usuario: IUser, index: number): void {
    this.usuarioEdicion = { ...usuario }; // Clonar el usuario para la edición
    this.nuevoUsuario = { ...usuario }; // Cargar los datos del usuario en el formulario
    this.indiceEdicion = index; // Almacenar el índice del usuario en edición
    this.desplegado[index] = true; // Abrir el desplegable del usuario que se está editando
    this.experiencEdition=usuario.experience;
  }

  eliminarElemento(index: number): void {
    const usuarioAEliminar = this.usuarios[index];
  
    // Verificación: Asegurarse de que el usuario tiene un _id válido
    if (!usuarioAEliminar._id) {
      console.error('El usuario no tiene un _id válido. No se puede eliminar.');
      alert('El usuario no se puede eliminar porque no está registrado en la base de datos.');
      return;
    }
  
    // Verificación: Si el usuario no tiene experiencias
    if (!usuarioAEliminar.experience || usuarioAEliminar.experience.length === 0) {
      console.log('No hay experiencias para eliminar.');
    } else {
      if (confirm(`¿Estás seguro de que deseas eliminar a ${usuarioAEliminar.name} y todas sus experiencias?`)) {
        const eliminarExperienciasObservables = usuarioAEliminar.experience.map(expId => {
          if (typeof expId === 'string' && usuarioAEliminar._id) {
            // Llamar al servicio para eliminar cada experiencia, pasando la ID del usuario y la experiencia
            return this.userService.deleteExperience(usuarioAEliminar._id, expId);
          } else {
            console.warn('Se encontró un ID de experiencia no válido:', expId);
            return of(null); // Retornar un observable vacío en caso de ID no válido
          }
        }).filter(observable => observable !== null);
  
        // Usar forkJoin para esperar a que todas las experiencias se eliminen antes de eliminar al usuario
        forkJoin(eliminarExperienciasObservables).subscribe({
          next: (responses) => {
            console.log(`${responses.length} experiencias eliminadas:`, responses);
  
            // Una vez eliminadas las experiencias, proceder a eliminar el usuario
            this.userService.deleteUserById(usuarioAEliminar._id!).subscribe(
              response => {
                console.log('Usuario eliminado:', response);
                this.usuarios.splice(index, 1); // Eliminar el usuario del array local
                this.desplegado.splice(index, 1); // Eliminar el estado desplegado del usuario
              },
              error => {
                console.error('Error al eliminar el usuario:', error);
                alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
              }
            );
          },
          error: (error) => {
            console.error('Error al eliminar experiencias:', error);
            alert('Error al eliminar experiencias. Por favor, inténtalo de nuevo.');
          }
        });
      }
    }
  }
  

  
  

  // Función para alternar la visualización del desplegable
  toggleDesplegable(index: number, userId?: string): void {
    this.desplegado[index] = !this.desplegado[index];

    // Solo cargar las experiencias si el desplegable se abre y no están ya cargadas
    if (this.desplegado[index] && !this.experiencias[index]) {
      this.loadExperiences(userId, index);
    }
  }

  // Método para alternar entre mostrar más o menos texto
  toggleBiografia(index: number) {
    // Cambia el estado entre desplegado y no desplegado
    this.desplegarBiografia[index] = !this.desplegarBiografia[index];
  }

  // Función para alternar la visibilidad de la contraseña
  togglePassword(index: number): void {
    this.mostrarPassword[index] = !this.mostrarPassword[index]; // Cambiamos entre true y false
  }

  

}


