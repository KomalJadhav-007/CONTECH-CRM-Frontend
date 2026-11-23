import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DriverTripService } from '../driver-trip.service';
import { AuthService } from '../../../auth/auth.service';
import { SettingsService } from '../../../settings/settings.service';

@Component({
  selector: 'app-driver-trips',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, MatProgressBarModule],
  templateUrl: './driver-trips.component.html',
  styleUrl: './driver-trips.component.css'
})

export class DriverTripsComponent implements OnInit {
  private tripService = inject(DriverTripService);
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);

  loading = true;
  trips: any[] = [];
  filterStatus = '';
  updatingId: number | null = null;
  statusMessage = '';

  // Project Filtering for Super Admin & Admin
  currentUser: any = null;
  isAdminOrSuperAdmin = false;
  projectsList: any[] = [];
  selectedProject: string | number = 'all';

  // Pagination for Daily Trips
  currentPage = 1;
  pageSize = 6;

  get totalPages(): number {
    const size = Number(this.pageSize) || 6;
    return Math.max(1, Math.ceil(this.filteredTrips.length / size));
  }

  get pagedTrips(): any[] {
    const size = Number(this.pageSize) || 6;
    const page = Math.max(1, Number(this.currentPage) || 1);
    const start = (page - 1) * size;
    return this.filteredTrips.slice(start, start + size);
  }

  get tripStartItem(): number {
    if (!this.filteredTrips || this.filteredTrips.length === 0) return 0;
    const size = Number(this.pageSize) || 6;
    const page = Math.max(1, Number(this.currentPage) || 1);
    return (page - 1) * size + 1;
  }

  get tripEndItem(): number {
    if (!this.filteredTrips || this.filteredTrips.length === 0) return 0;
    const size = Number(this.pageSize) || 6;
    const page = Math.max(1, Number(this.currentPage) || 1);
    return Math.min(page * size, this.filteredTrips.length);
  }

  setPageSize(size: any): void {
    this.pageSize = Number(size) || 6;
    this.currentPage = 1;
  }

  setFilter(status: string): void {
    this.filterStatus = status;
    this.currentPage = 1;
  }

  get filteredTrips(): any[] {
    let list = this.trips;
    if (this.selectedProject && this.selectedProject !== 'all') {
      list = list.filter(t => {
        const pid = t.siteVisit?.project_id || t.siteVisit?.project?.project_id || t.siteVisit?.project?.id;
        return String(pid) === String(this.selectedProject);
      });
    }
    if (!this.filterStatus) return list;
    if (this.filterStatus === 'ACTIVE') {
      return list.filter(t => t.trip_status !== 'COMPLETED');
    }
    if (this.filterStatus === 'COMPLETED') {
      return list.filter(t => t.trip_status === 'COMPLETED');
    }
    return list;
  }

  get totalProjectTripsCount(): number {
    if (!this.selectedProject || this.selectedProject === 'all') return this.trips.length;
    return this.trips.filter(t => {
      const pid = t.siteVisit?.project_id || t.siteVisit?.project?.project_id || t.siteVisit?.project?.id;
      return String(pid) === String(this.selectedProject);
    }).length;
  }

  get activeTripsCount(): number {
    let list = this.trips;
    if (this.selectedProject && this.selectedProject !== 'all') {
      list = list.filter(t => {
        const pid = t.siteVisit?.project_id || t.siteVisit?.project?.project_id || t.siteVisit?.project?.id;
        return String(pid) === String(this.selectedProject);
      });
    }
    return list.filter(t => t.trip_status !== 'COMPLETED').length;
  }

  get completedTripsCount(): number {
    let list = this.trips;
    if (this.selectedProject && this.selectedProject !== 'all') {
      list = list.filter(t => {
        const pid = t.siteVisit?.project_id || t.siteVisit?.project?.project_id || t.siteVisit?.project?.id;
        return String(pid) === String(this.selectedProject);
      });
    }
    return list.filter(t => t.trip_status === 'COMPLETED').length;
  }

  get liveDutyStatus(): {
    status: 'AVAILABLE' | 'BUSY' | 'ASSIGNED',
    pillText: string,
    title: string,
    subtitle: string,
    icon: string,
    class: string,
    activeTrip?: any
  } {
    if (this.isAdminOrSuperAdmin) {
      const activeCount = this.activeTripsCount;
      const completedCount = this.completedTripsCount;
      if (activeCount > 0) {
        return {
          status: 'BUSY',
          pillText: 'LIVE FLEET DISPATCH',
          title: `FLEET STATUS: ${activeCount} ACTIVE JOURNEYS IN TRANSIT`,
          subtitle: `${activeCount} driver(s) currently en route. Once a driver completes their trip, they are immediately released to AVAILABLE.`,
          icon: 'directions_car',
          class: 'duty-busy'
        };
      }
      return {
        status: 'AVAILABLE',
        pillText: 'FLEET READY',
        title: 'FLEET STATUS: ALL DRIVERS & VEHICLES AVAILABLE',
        subtitle: `All ${completedCount} site visit trips completed. Drivers & vehicles are released and available for next site visit booking.`,
        icon: 'verified',
        class: 'duty-available'
      };
    }

    // Individual Driver View: Once the trip is completed, driver is available
    const ongoingTrip = this.trips.find(t =>
      t.trip_status === 'STARTED' ||
      t.trip_status === 'ARRIVED_PICKUP' ||
      t.trip_status === 'PASSENGER_ONBOARD'
    );
    if (ongoingTrip) {
      return {
        status: 'BUSY',
        pillText: 'DUTY STATUS: BUSY',
        title: `ON ACTIVE TRIP (${ongoingTrip.siteVisit?.time_slot || 'Today'})`,
        subtitle: `En route with passenger ${ongoingTrip.passenger_name || 'Buyer'} (${ongoingTrip.passenger_phone || ''}). Once you complete this trip, your status immediately becomes AVAILABLE for next booking.`,
        icon: 'directions_car',
        class: 'duty-busy',
        activeTrip: ongoingTrip
      };
    }

    const assignedTrip = this.trips.find(t => t.trip_status === 'ASSIGNED');
    if (assignedTrip) {
      return {
        status: 'ASSIGNED',
        pillText: 'DUTY STATUS: RESERVED',
        title: `SCHEDULED FOR UPCOMING PICKUP (${assignedTrip.siteVisit?.time_slot || 'Today'})`,
        subtitle: `Assigned for passenger ${assignedTrip.passenger_name || 'Buyer'}. Click "Start Trip" when commencing transit.`,
        icon: 'pending_actions',
        class: 'duty-assigned',
        activeTrip: assignedTrip
      };
    }

    return {
      status: 'AVAILABLE',
      pillText: 'DUTY STATUS: AVAILABLE',
      title: 'STATUS: AVAILABLE (READY FOR NEXT BOOKING)',
      subtitle: 'All assigned site visit trips are completed. Driver and vehicle released to fleet pool and available for new dispatches.',
      icon: 'verified',
      class: 'duty-available'
    };
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && (this.currentUser.is_active === false || this.currentUser.is_active === 0 || this.currentUser.is_active === '0' || this.currentUser.is_active === 'false')) {
      this.authService.revokeSession('ACCOUNT_DEACTIVATED');
      return;
    }

    const role = String(this.currentUser?.role || this.currentUser?.role_code || '').toUpperCase();
    this.isAdminOrSuperAdmin = !role.includes('DRIVER');

    if (this.isAdminOrSuperAdmin) {
      this.loadProjects();
    }
    this.loadTrips();
  }

  loadProjects(): void {
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        if (res && res.projects && res.projects.length > 0) {
          this.projectsList = res.projects.map((p: any) => ({
            project_id: p.project_id || p.id,
            id: p.project_id || p.id,
            name: p.name,
            code: p.code || '',
            location: p.location || ''
          }));
        }
      }
    });
  }

  onProjectFilterChange(): void {
    this.currentPage = 1;
    this.loadTrips();
  }

  setProjectFilter(projectId: string | number): void {
    this.selectedProject = projectId;
    this.currentPage = 1;
    this.loadTrips();
  }

  clearProjectFilter(): void {
    this.selectedProject = 'all';
    this.currentPage = 1;
    this.loadTrips();
  }

  getSelectedProjectName(): string {
    if (this.selectedProject === 'all') return 'All Projects';
    const prj = this.projectsList.find(p => (p.project_id || p.id) == this.selectedProject);
    return prj ? prj.name : `Project #${this.selectedProject}`;
  }

  loadTrips(): void {
    this.loading = true;
    this.tripService.getMyTrips(this.selectedProject).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.trips = res.trips || [];
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403 || err.error?.code === 'ACCOUNT_DEACTIVATED') {
          this.authService.revokeSession('ACCOUNT_DEACTIVATED');
        }
      }
    });
  }

  getPassengerWhatsAppUrl(trip: any): string {
    const raw = String(trip.passenger_phone || '7058533669').replace(/\D/g, '');
    const clean = raw.length === 10 ? '91' + raw : raw;
    const msg = `Hello ${trip.passenger_name || 'Sir/Madam'}, this is your Contech CRM executive driver. I am assigned for your scheduled site visit pickup at ${trip.pickup_address || 'your location'}.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
  }

  updateStatus(trip: any, nextStatus: string): void {
    const id = trip.id || trip.driver_trip_id;
    this.updatingId = id;
    this.tripService.updateTripStatus(id, nextStatus).subscribe({
      next: (res) => {
        this.updatingId = null;
        if (res.success) {
          trip.trip_status = nextStatus;
          this.statusMessage = `Journey status updated: ${nextStatus === 'STARTED' ? 'Trip Started' : 'Trip Completed'}`;
          setTimeout(() => this.statusMessage = '', 3500);
        }
      },
      error: (err) => {
        this.updatingId = null;
        if (err.status === 401 || err.status === 403 || err.error?.code === 'ACCOUNT_DEACTIVATED') {
          this.authService.revokeSession('ACCOUNT_DEACTIVATED');
        }
      }
    });
  }
}
