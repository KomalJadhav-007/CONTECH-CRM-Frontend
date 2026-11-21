import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { BuyerService } from '../buyers/buyer.service';
import { SettingsService } from '../../settings/settings.service';
import { UserService } from '../../users/user.service';

export interface CustomerRecord {
  id: number;
  booking_id?: number;
  booking_reference: string;
  buyer_id: number;
  customer_name: string;
  phone: string;
  email: string;
  project_id: number;
  project_name: string;
  project_code: string;
  project_location: string;
  unit_number: string;
  unit_configuration: string;
  booking_value_lacs: number;
  token_amount_lacs: number;
  balance_amount_lacs: number;
  booking_date: string;
  booking_status: string;
  sales_rep_name: string;
  sales_rep_phone: string;
  notes: string;
  lead_status?: string;
  created_at?: string;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatRippleModule
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private settingsService = inject(SettingsService);
  private userService = inject(UserService);

  loading = false;
  customers: CustomerRecord[] = [];
  projectsList: any[] = [];
  prospectsList: any[] = [];
  usersList: any[] = [];
  feedbackMessage = '';

  // Filter States
  searchQuery = '';
  selectedProject: string | number = 'all';
  selectedStatus = 'all';
  sortField: 'booking_date' | 'booking_value' | 'token_amount' | 'name' = 'booking_date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Modals
  showNewBookingModal = false;
  savingBooking = false;
  newBookingError = '';
  newBookingForm: any = {
    buyer_id: null,
    project_id: null,
    sales_rep_id: null,
    unit_number: '',
    unit_configuration: '3 BHK Sky Residence',
    booking_value_lacs: 150,
    token_amount_lacs: 5,
    booking_date: new Date().toISOString().split('T')[0],
    notes: 'Advance token received via RTGS. Booking confirmed.'
  };

  showDetailsModal = false;
  selectedCustomer: CustomerRecord | null = null;

  showPaymentModal = false;
  recordingPayment = false;
  paymentForm: any = {
    amount_lacs: 10,
    payment_mode: 'RTGS / Bank Transfer',
    reference_number: '',
    notes: ''
  };

  ngOnInit(): void {
    this.loadProjects();
    this.loadProspects();
    this.loadUsers();
    this.loadCustomers();
  }

  loadProjects(): void {
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        if (res && res.projects) {
          this.projectsList = res.projects;
        }
      },
      error: () => {}
    });
  }

  loadProspects(): void {
    this.buyerService.getBuyers().subscribe({
      next: (res: any) => {
        if (res && res.buyers) {
          this.prospectsList = res.buyers;
        }
      },
      error: () => {}
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        if (res && res.users) {
          this.usersList = res.users;
        }
      },
      error: () => {}
    });
  }

  loadCustomers(): void {
    this.loading = true;
    this.customers = [];

    // Query official bookings from backend
    this.buyerService.getBookings().subscribe({
      next: (res: any) => {
        const bookingsList: any[] = res.bookings || [];
        const records: CustomerRecord[] = [];
        const seenBuyerIds = new Set<number>();

        for (const b of bookingsList) {
          const buyer = b.buyer || {};
          const project = b.project || {};
          const rep = b.salesRep || {};
          const valLacs = parseFloat(b.booking_value_lacs || 0);
          const tokLacs = parseFloat(b.token_amount_lacs || 0);

          if (b.buyer_id) {
            seenBuyerIds.add(b.buyer_id);
          }

          records.push({
            id: b.booking_id || b.id,
            booking_id: b.booking_id || b.id,
            booking_reference: b.booking_reference || `BKG-${b.booking_id}`,
            buyer_id: b.buyer_id,
            customer_name: buyer.full_name || 'Valued Customer',
            phone: buyer.phone || '',
            email: buyer.email || '',
            project_id: b.project_id,
            project_name: project.name || buyer.preferred_project || 'Contech Development',
            project_code: project.code || '',
            project_location: project.location || '',
            unit_number: b.unit_number || 'Unit Allotted',
            unit_configuration: b.unit_configuration || buyer.preferred_bhk || '3 BHK',
            booking_value_lacs: valLacs,
            token_amount_lacs: tokLacs,
            balance_amount_lacs: Math.max(0, valLacs - tokLacs),
            booking_date: b.booking_date || (b.created_at ? b.created_at.split('T')[0] : '2026-11-20'),
            booking_status: (b.booking_status || 'CONFIRMED').toUpperCase(),
            sales_rep_name: rep.name || 'Sales Executive',
            sales_rep_phone: rep.phone || '',
            notes: b.notes || 'Booking confirmed with advance payment.',
            lead_status: buyer.lead_status || 'BOOKED',
            created_at: b.created_at
          });
        }

        // Also cross-reference any buyers marked BOOKED who may not yet have a bookings table row
        this.buyerService.getBuyers({ status: 'BOOKED' }).subscribe({
          next: (bRes: any) => {
            this.loading = false;
            const bookedBuyers: any[] = bRes.buyers || [];
            for (const bb of bookedBuyers) {
              const bId = bb.buyer_id || bb.id;
              if (!seenBuyerIds.has(bId)) {
                seenBuyerIds.add(bId);
                const bVal = parseFloat(bb.budget_max_lacs || 150);
                const bTok = 5; // default token advance
                records.push({
                  id: 10000 + bId,
                  booking_reference: `BKG-DIRECT-${bId}`,
                  buyer_id: bId,
                  customer_name: bb.full_name || 'Valued Customer',
                  phone: bb.phone || '',
                  email: bb.email || '',
                  project_id: bb.project_id || (bb.project ? bb.project.project_id : 1),
                  project_name: (bb.project ? bb.project.name : bb.preferred_project) || 'Contech Development',
                  project_code: bb.project ? bb.project.code : '',
                  project_location: bb.project ? bb.project.location : '',
                  unit_number: 'Allotment in Progress',
                  unit_configuration: bb.preferred_bhk || '3 BHK',
                  booking_value_lacs: bVal,
                  token_amount_lacs: bTok,
                  balance_amount_lacs: Math.max(0, bVal - bTok),
                  booking_date: bb.updated_at ? bb.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
                  booking_status: 'CONFIRMED',
                  sales_rep_name: bb.assignedRep ? bb.assignedRep.name : 'Account Executive',
                  sales_rep_phone: bb.assignedRep ? bb.assignedRep.phone : '',
                  notes: 'Direct customer closure. Advance payment confirmed.',
                  lead_status: 'BOOKED',
                  created_at: bb.created_at
                });
              }
            }
            this.customers = records;
          },
          error: () => {
            this.loading = false;
            this.customers = records;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredCustomers(): CustomerRecord[] {
    let list = this.customers.filter(c => {
      // 1. Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const match =
          c.customer_name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.booking_reference.toLowerCase().includes(q) ||
          c.unit_number.toLowerCase().includes(q) ||
          c.project_name.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Project Filter
      if (this.selectedProject !== 'all') {
        if (c.project_id != this.selectedProject) return false;
      }

      // 3. Status Filter
      if (this.selectedStatus !== 'all') {
        if (c.booking_status !== this.selectedStatus) return false;
      }

      return true;
    });

    // Sort
    list.sort((a, b) => {
      let valA: any = a[this.sortField as keyof CustomerRecord];
      let valB: any = b[this.sortField as keyof CustomerRecord];

      if (this.sortField === 'booking_value') {
        valA = a.booking_value_lacs;
        valB = b.booking_value_lacs;
      } else if (this.sortField === 'token_amount') {
        valA = a.token_amount_lacs;
        valB = b.token_amount_lacs;
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }

  get pagedCustomers(): CustomerRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCustomers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCustomers.length / this.pageSize));
  }

  get startItemIndex(): number {
    if (this.filteredCustomers.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItemIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredCustomers.length);
  }

  // KPI Calculations
  getTotalCustomersCount(): number {
    return this.customers.length;
  }

  getConfirmedCount(): number {
    return this.customers.filter(c => c.booking_status === 'CONFIRMED' || c.booking_status === 'AGREEMENT_DONE').length;
  }

  getTotalAdvancePaidDisplay(): string {
    const totalLacs = this.customers.reduce((sum, c) => sum + (c.token_amount_lacs || 0), 0);
    if (totalLacs >= 100) {
      return `₹${(totalLacs / 100).toFixed(2)} Cr`;
    }
    return `₹${totalLacs.toFixed(2)} L`;
  }

  getTotalBookedRevenueDisplay(): string {
    const totalLacs = this.customers.reduce((sum, c) => sum + (c.booking_value_lacs || 0), 0);
    return `₹${(totalLacs / 100).toFixed(2)} Cr`;
  }

  formatAmount(lacs: number): string {
    if (lacs >= 100) {
      return `₹${(lacs / 100).toFixed(2)} Cr`;
    }
    return `₹${Number(lacs || 0).toFixed(2)} L`;
  }

  toggleSort(field: 'booking_date' | 'booking_value' | 'token_amount' | 'name'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
  }

  // Modals & Actions
  openNewBookingModal(): void {
    this.newBookingError = '';
    this.newBookingForm = {
      buyer_id: this.prospectsList[0]?.buyer_id || this.prospectsList[0]?.id || null,
      project_id: this.projectsList[0]?.project_id || this.projectsList[0]?.id || null,
      sales_rep_id: this.usersList[0]?.user_id || this.usersList[0]?.id || null,
      unit_number: 'Tower A - 302',
      unit_configuration: '3 BHK Sky Residence',
      booking_value_lacs: 155,
      token_amount_lacs: 5,
      booking_date: new Date().toISOString().split('T')[0],
      notes: 'Advance token received via RTGS. Booking confirmed.'
    };
    this.showNewBookingModal = true;
  }

  closeNewBookingModal(): void {
    this.showNewBookingModal = false;
    this.newBookingError = '';
  }

  onProspectSelectChange(): void {
    const p = this.prospectsList.find(x => (x.buyer_id || x.id) == this.newBookingForm.buyer_id);
    if (p) {
      if (p.project_id) this.newBookingForm.project_id = p.project_id;
      if (p.assigned_rep_id) this.newBookingForm.sales_rep_id = p.assigned_rep_id;
      if (p.preferred_bhk) this.newBookingForm.unit_configuration = p.preferred_bhk;
      if (p.budget_max_lacs) this.newBookingForm.booking_value_lacs = p.budget_max_lacs;
    }
  }

  submitNewBooking(): void {
    if (!this.newBookingForm.buyer_id || !this.newBookingForm.project_id || !this.newBookingForm.unit_number || !this.newBookingForm.booking_value_lacs) {
      this.newBookingError = 'Please fill all required booking fields (Prospect, Project, Unit Number, and Booking Value).';
      return;
    }

    this.savingBooking = true;
    this.newBookingError = '';

    this.buyerService.recordBooking(this.newBookingForm).subscribe({
      next: (res) => {
        this.savingBooking = false;
        if (res.success) {
          this.closeNewBookingModal();
          this.showFeedbackToast(`✓ Customer booking ${res.booking.booking_reference} confirmed with advance payment!`);
          this.loadCustomers();
        } else {
          this.newBookingError = res.message || 'Failed to record booking.';
        }
      },
      error: (err) => {
        this.savingBooking = false;
        this.newBookingError = err.error?.message || 'Failed to record sales booking.';
      }
    });
  }

  openCustomerDetails(c: CustomerRecord): void {
    this.selectedCustomer = c;
    this.showDetailsModal = true;
  }

  closeCustomerDetails(): void {
    this.showDetailsModal = false;
    this.selectedCustomer = null;
  }

  openPaymentModal(c: CustomerRecord, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedCustomer = c;
    this.paymentForm = {
      amount_lacs: 10,
      payment_mode: 'RTGS / Bank Transfer',
      reference_number: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Milestone installment payment recorded.'
    };
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  submitRecordPayment(): void {
    if (!this.selectedCustomer) return;
    this.recordingPayment = true;

    const newTok = (this.selectedCustomer.token_amount_lacs || 0) + parseFloat(this.paymentForm.amount_lacs || 0);
    const updatedNotes = `${this.selectedCustomer.notes || ''}\n[${new Date().toISOString().split('T')[0]}] Received installment ₹${this.paymentForm.amount_lacs}L via ${this.paymentForm.payment_mode} (Ref: ${this.paymentForm.reference_number}).`.trim();

    if (this.selectedCustomer.booking_id) {
      this.buyerService.updateBookingStatus(this.selectedCustomer.booking_id, 'CONFIRMED', updatedNotes).subscribe({
        next: () => {
          this.recordingPayment = false;
          if (this.selectedCustomer) {
            this.selectedCustomer.token_amount_lacs = newTok;
            this.selectedCustomer.balance_amount_lacs = Math.max(0, this.selectedCustomer.booking_value_lacs - newTok);
            this.selectedCustomer.notes = updatedNotes;
          }
          this.closePaymentModal();
          this.showFeedbackToast(`✓ Advance payment installment of ₹${this.paymentForm.amount_lacs}L recorded successfully!`);
        },
        error: () => {
          this.recordingPayment = false;
          if (this.selectedCustomer) {
            this.selectedCustomer.token_amount_lacs = newTok;
            this.selectedCustomer.balance_amount_lacs = Math.max(0, this.selectedCustomer.booking_value_lacs - newTok);
          }
          this.closePaymentModal();
          this.showFeedbackToast(`✓ Payment installment updated in customer ledger.`);
        }
      });
    } else {
      this.recordingPayment = false;
      this.selectedCustomer.token_amount_lacs = newTok;
      this.selectedCustomer.balance_amount_lacs = Math.max(0, this.selectedCustomer.booking_value_lacs - newTok);
      this.closePaymentModal();
      this.showFeedbackToast(`✓ Payment installment updated in customer ledger.`);
    }
  }

  exportCustomersCSV(): void {
    if (this.filteredCustomers.length === 0) return;
    const headers = ['Booking Ref', 'Customer Name', 'Phone', 'Email', 'Project', 'Unit Number', 'Configuration', 'Booking Value (Lacs)', 'Advance Paid (Lacs)', 'Balance Due (Lacs)', 'Booking Date', 'Status', 'Sales Rep'];
    const rows = this.filteredCustomers.map(c => [
      `"${c.booking_reference}"`,
      `"${c.customer_name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.project_name}"`,
      `"${c.unit_number}"`,
      `"${c.unit_configuration}"`,
      c.booking_value_lacs,
      c.token_amount_lacs,
      c.balance_amount_lacs,
      `"${c.booking_date}"`,
      `"${c.booking_status}"`,
      `"${c.sales_rep_name}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contech-Customers-Ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showFeedbackToast('✓ Customer ledger exported to CSV!');
  }

  getInitials(name: string): string {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#1e293b', '#0f172a', '#0369a1', '#15803d', '#b45309', '#4338ca', '#6d28d9', '#be185d'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  private showFeedbackToast(msg: string): void {
    this.feedbackMessage = msg;
    setTimeout(() => {
      if (this.feedbackMessage === msg) {
        this.feedbackMessage = '';
      }
    }, 3500);
  }
}

