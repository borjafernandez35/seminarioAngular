import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { UsuarisComponent } from './components/usuaris/usuaris.component';
import { ExperienciaComponent } from './components/experiencia/experiencia.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirige a Home por defecto
  { path: 'home', component: HomeComponent },
  { path: 'usuaris', component: UsuarisComponent },
  { path: 'experiencia', component: ExperienciaComponent },
  { path: '**', redirectTo: 'home' } // Redirige cualquier ruta desconocida a Home
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], // Activar el modo hash para evitar problemas con el enrutado
  exports: [RouterModule]
})
export class AppRoutingModule {}


