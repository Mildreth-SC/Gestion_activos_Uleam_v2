import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { ActivosComponent } from './features/activos/pages/activos.component';
import { ReportesComponent } from './features/reportes/pages/reportes.component';
import { UsuariosComponent } from './features/usuarios/pages/usuarios.component';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas (solo accesibles si NO está autenticado)
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [noAuthGuard],
    title: 'Iniciar Sesión - ULEAM'
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [noAuthGuard],
    title: 'Registro - ULEAM'
  },
  
  // Rutas protegidas (requieren autenticación)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'Dashboard - ULEAM'
  },
  { 
    path: 'activos', 
    component: ActivosComponent,
    canActivate: [authGuard],
    title: 'Gestión de Activos - ULEAM'
  },
  { 
    path: 'reportes', 
    component: ReportesComponent,
    canActivate: [authGuard],
    title: 'Reportes CSV - ULEAM'
  },
  { 
    path: 'usuarios', 
    component: UsuariosComponent,
    canActivate: [authGuard],
    title: 'Usuarios Registrados - ULEAM'
  },
  
  // Redirecciones
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
