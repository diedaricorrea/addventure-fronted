import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ProfileComponent } from './components/user/profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  // Rutas protegidas
  { path: 'perfil', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'perfil/:id', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
