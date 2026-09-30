import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);

  loading = true;
  users: any[] = [];
  showModal = false;
  newUser = {
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    role_id: 3
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.users = res.users;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCreateModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  createUser() {
    this.userService.createUser(this.newUser).subscribe({
      next: (res) => {
        if (res.success) {
          this.closeModal();
          this.loadUsers();
        }
      }
    });
  }
}
