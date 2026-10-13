import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './settings-view.component.html',
  styleUrl: './settings-view.component.css'
})
export class SettingsViewComponent implements OnInit {
  private settingsService = inject(SettingsService);

  loading = false;
  savedMessage = '';

  org = {
    name: 'ABC Realty',
    slug: 'abc realty',
    email: 'admin@contechcrm.com',
    status: 'active'
  };

  profile = {
    firstName: 'Meera',
    lastName: 'Iyer',
    mobile: '+91 98200 10001',
    designation: 'Organisation Administrator'
  };

  scoring = {
    profileFit: 20,
    digitalIntent: 20,
    requirementBudgetFit: 25,
    readinessMomentum: 35
  };

  ngOnInit(): void {
    // Initialise settings
  }

  saveProfile(): void {
    this.savedMessage = 'Profile updated successfully.';
    setTimeout(() => (this.savedMessage = ''), 3000);
  }

  saveScoring(): void {
    this.savedMessage = 'Scoring configuration saved successfully.';
    setTimeout(() => (this.savedMessage = ''), 3000);
  }
}
