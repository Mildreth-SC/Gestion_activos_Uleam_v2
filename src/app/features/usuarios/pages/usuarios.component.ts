import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';

interface User {
  username: string;
  registrationDate: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const usersData = localStorage.getItem('users');
    if (usersData) {
      const usersArray = JSON.parse(usersData);
      // Los usuarios están almacenados como array, no como objeto
      if (Array.isArray(usersArray)) {
        this.users = usersArray.map(user => ({
          username: user.username,
          registrationDate: user.registrationDate || 'No disponible'
        }));
      } else {
        // Fallback por si acaso está en formato objeto
        this.users = Object.keys(usersArray).map(username => ({
          username: username,
          registrationDate: usersArray[username].registrationDate || 'No disponible'
        }));
      }
      this.filteredUsers = [...this.users];
    }
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(term)
    );
  }

  exportToCSV(): void {
    const headers = ['Usuario', 'Fecha de Registro'];
    const rows = this.filteredUsers.map(user => [
      user.username,
      user.registrationDate
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
