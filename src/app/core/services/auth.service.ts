import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  username: string;
  password: string;
  registrationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'users';
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAdmin();
    this.loadCurrentUser();
  }

  /**
   * Inicializa el usuario administrador por defecto
   */
  private initializeAdmin(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      const registrationDate = new Date().toLocaleDateString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      users.push({ username: 'admin', password: 'admin', registrationDate });
      this.saveUsers(users);
      console.log('Usuario admin por defecto creado.');
    }
  }

  /**
   * Carga el usuario actual desde sessionStorage
   */
  private loadCurrentUser(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      this.currentUserSubject.next(currentUser);
    }
  }

  /**
   * Obtiene todos los usuarios
   */
  private getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  /**
   * Guarda usuarios en localStorage
   */
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Intenta iniciar sesión con las credenciales proporcionadas
   */
  login(username: string, password: string): { success: boolean; message: string } {
    if (!username.trim() || !password.trim()) {
      return { success: false, message: 'Por favor, ingrese su usuario y contraseña.' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      sessionStorage.setItem('currentUser', username);
      this.currentUserSubject.next(username);
      return { success: true, message: 'Inicio de sesión exitoso' };
    }

    return { success: false, message: 'Usuario o contraseña incorrectos.' };
  }

  /**
   * Registra un nuevo usuario
   */
  register(username: string, password: string): { success: boolean; message: string } {
    if (username.length < 4) {
      return { success: false, message: 'El nombre de usuario debe tener al menos 4 caracteres.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const users = this.getUsers();

    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Este nombre de usuario ya está en uso.' };
    }

    const registrationDate = new Date().toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    users.push({ username, password, registrationDate });
    this.saveUsers(users);

    return { success: true, message: '¡Registro exitoso! Ahora puedes iniciar sesión.' };
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Obtiene el nombre del usuario actual
   */
  getCurrentUser(): string | null {
    return this.currentUserSubject.value;
  }
}
