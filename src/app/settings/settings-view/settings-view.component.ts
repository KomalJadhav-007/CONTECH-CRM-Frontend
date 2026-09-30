import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-view.component.html',
  styleUrl: './settings-view.component.css'
})
export class SettingsViewComponent implements OnInit {
  private settingsService = inject(SettingsService);

  loading = true;
  settings: any[] = [];
  projects: any[] = [];
  savedMessage = '';

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.settingsService.getSettings().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.settings = res.settings;
          this.projects = res.projects;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  saveSetting(setting: any): void {
    this.settingsService.updateSetting(setting.key, setting.value).subscribe({
      next: () => {
        this.savedMessage = `Setting "${setting.key}" updated successfully.`;
        setTimeout(() => this.savedMessage = '', 3000);
      }
    });
  }
}
