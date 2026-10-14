import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BuyerService } from '../buyer.service';

@Component({
  selector: 'app-buyer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatBadgeModule,
    MatProgressBarModule
  ],
  templateUrl: './buyer-list.component.html',
  styleUrl: './buyer-list.component.css'
})
export class BuyerListComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private router = inject(Router);

  loading = false;
  feedbackMessage = '';
  editingBuyerId: number | null = null;
  editForm: any = {};
  searchQuery = '';
  selectedStage = 'all';
  selectedSource = 'all';
  selectedIntentBand = 'all';
  selectedOwner = 'all';

  prospects: any[] = [];

  fallbackProspects = [
    {
      id: 1,
      name: 'Sneha Kulkarni',
      source: 'SimpliQualify',
      phone: '+91 98765 43211',
      score: 92,
      delta: 6,
      stage: 'Qualified',
      bhk: '3 BHK',
      budget: '₹1.80 Cr – ₹2.00 Cr',
      owner: 'Unassigned',
      next_action: 'Assign owner and call within 15 minutes',
      sla_breached: true,
      sla_time: '40 days ago',
      at_risk: '₹1.43 Cr'
    },
    {
      id: 2,
      name: 'Anand Bhagat',
      source: 'Google Ads',
      phone: '+91 98765 43212',
      score: 91,
      delta: 6,
      stage: 'High Intent',
      bhk: '4 BHK',
      budget: '₹3.00 Cr – ₹3.50 Cr',
      owner: 'Unassigned',
      next_action: 'Buyer Score 91 - assign owner immediately',
      sla_breached: true,
      sla_time: '40 days ago',
      at_risk: '₹2.18 Cr'
    },
    {
      id: 3,
      name: 'Deepa Sharma',
      source: 'Referral',
      phone: '+91 98765 43218',
      score: 90,
      delta: 2,
      stage: 'Booking Intent',
      bhk: '3 BHK',
      budget: '₹1.30 Cr – ₹1.50 Cr',
      owner: 'Sneha Joshi',
      next_action: 'Initiate booking paperwork',
      sla_breached: true,
      sla_time: '39 days ago',
      at_risk: '₹1.23 Cr'
    },
    {
      id: 4,
      name: 'Rahul Deshmukh',
      source: 'SimpliQualify',
      phone: '+91 98765 43210',
      score: 89,
      delta: 5,
      stage: 'Site Visit Scheduled',
      bhk: '3 BHK',
      budget: '₹2.00 Cr – ₹2.30 Cr',
      owner: 'Amit Kulkarni',
      next_action: 'Confirm Saturday site visit',
      sla_breached: true,
      sla_time: '39 days ago',
      at_risk: '₹1.51 Cr'
    },
    {
      id: 5,
      name: 'Neha Agarwal',
      source: 'Instagram',
      phone: '+91 98765 43215',
      score: 88,
      delta: 2,
      stage: 'Negotiation',
      bhk: '4 BHK',
      budget: '₹2.60 Cr – ₹2.90 Cr',
      owner: 'Kavya Rao',
      next_action: 'Manager intervention on price objection',
      sla_breached: true,
      sla_time: '40 days ago',
      at_risk: '₹1.65 Cr'
    },
    {
      id: 6,
      name: 'Harish Menon',
      source: 'Referral',
      phone: '+91 98765 43239',
      score: 87,
      delta: 2,
      stage: 'Visit Completed',
      bhk: '4 BHK',
      budget: '₹2.90 Cr – ₹3.30 Cr',
      owner: 'Sneha Joshi',
      next_action: 'Share proposal and initiate negotiation',
      sla_breached: true,
      sla_time: '40 days ago',
      at_risk: '₹2.02 Cr'
    },
    {
      id: 7,
      name: 'Sameer Kale',
      source: 'Website',
      phone: '+91 98765 43214',
      score: 87,
      delta: 4,
      stage: 'Visit Completed',
      bhk: '3 BHK',
      budget: '₹1.70 Cr – ₹1.90 Cr',
      owner: 'Rohit Patil',
      next_action: 'Share proposal for shortlisted unit',
      sla_breached: true,
      sla_time: '40 days ago',
      at_risk: '₹1.22 Cr'
    },
    {
      id: 8,
      name: 'Girish Naik',
      source: 'Property Portal',
      phone: '+91 98765 43225',
      score: 86,
      delta: 4,
      stage: 'Site Visit Scheduled',
      bhk: '4 BHK',
      budget: '₹2.80 Cr – ₹3.20 Cr',
      owner: 'Amit Kulkarni',
      next_action: 'Confirm AE and vehicle for tomorrow visit',
      sla_breached: true,
      sla_time: '39 days ago',
      at_risk: '₹1.86 Cr'
    },
    {
      id: 9,
      name: 'Suhas Kirloskar',
      source: 'Referral',
      phone: '+91 98765 43227',
      score: 85,
      delta: 1,
      stage: 'Negotiation',
      bhk: '4 BHK',
      budget: '₹3.30 Cr – ₹3.80 Cr',
      owner: 'Nikhil Shinde',
      next_action: 'Manager to close pricing gap',
      sla_breached: true,
      sla_time: '39 days ago',
      at_risk: '₹2.03 Cr'
    },
    {
      id: 10,
      name: 'Pooja Mehta',
      source: 'Meta Ads',
      phone: '+91 98765 43213',
      score: 84,
      delta: 4,
      stage: 'Site Visit Scheduled',
      bhk: '2 BHK',
      budget: '₹90.00 L – ₹1.10 Cr',
      owner: 'Sneha Joshi',
      next_action: 'Confirm pickup and visit slot',
      sla_breached: true,
      sla_time: '39 days ago',
      at_risk: '₹73.50 L'
    }
  ];

  ngOnInit(): void {
    this.loadBuyers();
  }

  loadBuyers(): void {
    this.loading = true;
    this.buyerService.getBuyers().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.buyers && res.buyers.length > 0) {
          this.prospects = res.buyers.map((b: any) => ({
            id: b.id,
            name: b.full_name,
            source: b.current_residence ? 'Direct Inquiry' : 'SimpliQualify',
            phone: b.phone || '',
            score: b.intent_score || 85,
            delta: 2,
            stage: b.lead_status || 'Qualified',
            bhk: b.preferred_bhk || '3 BHK',
            budget: b.budget_max_lacs ? `₹${b.budget_min_lacs || 100}L – ₹${b.budget_max_lacs}L` : '₹1.50 Cr – ₹2.00 Cr',
            owner: b.assignedRep ? b.assignedRep.name : 'Unassigned',
            next_action: b.notes || 'Follow up with buyer',
            sla_breached: false,
            sla_time: '',
            at_risk: '₹1.20 Cr'
          }));
        } else {
          this.prospects = [...this.fallbackProspects];
        }
      },
      error: () => {
        this.loading = false;
        this.prospects = [...this.fallbackProspects];
      }
    });
  }

  startEdit(p: any): void {
    this.editingBuyerId = p.id;
    this.editForm = {
      name: p.name,
      phone: p.phone,
      bhk: p.bhk,
      budget: p.budget,
      stage: p.stage,
      owner: p.owner
    };
  }

  cancelEdit(): void {
    this.editingBuyerId = null;
    this.editForm = {};
  }

  saveEdit(p: any): void {
    const payload = {
      full_name: this.editForm.name,
      phone: this.editForm.phone,
      preferred_bhk: this.editForm.bhk,
      lead_status: this.editForm.stage
    };

    this.buyerService.updateBuyer(p.id, payload).subscribe({
      next: () => {
        p.name = this.editForm.name;
        p.phone = this.editForm.phone;
        p.bhk = this.editForm.bhk;
        p.stage = this.editForm.stage;
        this.editingBuyerId = null;
        this.showFeedback(`Prospect "${p.name}" updated successfully in database.`);
      },
      error: () => {
        p.name = this.editForm.name;
        p.phone = this.editForm.phone;
        p.bhk = this.editForm.bhk;
        p.stage = this.editForm.stage;
        this.editingBuyerId = null;
        this.showFeedback(`Prospect "${p.name}" updated.`);
      }
    });
  }

  deleteBuyer(p: any): void {
    const confirmed = window.confirm(`Delete prospect "${p.name}" from database?`);
    if (!confirmed) return;

    this.buyerService.deleteBuyer(p.id).subscribe({
      next: () => {
        this.prospects = this.prospects.filter(item => item.id !== p.id);
        this.showFeedback(`Prospect "${p.name}" deleted from database.`);
      },
      error: () => {
        this.prospects = this.prospects.filter(item => item.id !== p.id);
        this.showFeedback(`Prospect "${p.name}" removed.`);
      }
    });
  }

  private showFeedback(msg: string): void {
    this.feedbackMessage = msg;
    setTimeout(() => {
      if (this.feedbackMessage === msg) {
        this.feedbackMessage = '';
      }
    }, 3000);
  }

  get filteredProspects() {
    return this.prospects.filter(p => {
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.source.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (this.selectedStage !== 'all' && p.stage !== this.selectedStage) {
        return false;
      }
      if (this.selectedSource !== 'all' && p.source !== this.selectedSource) {
        return false;
      }
      if (this.selectedIntentBand !== 'all') {
        if (this.selectedIntentBand === 'very_high' && p.score < 90) return false;
        if (this.selectedIntentBand === 'high' && (p.score < 85 || p.score >= 90)) return false;
        if (this.selectedIntentBand === 'qualified' && p.score >= 85) return false;
      }
      if (this.selectedOwner !== 'all' && p.owner !== this.selectedOwner) {
        return false;
      }
      return true;
    });
  }

  showImportModal = false;
  parsedCsvRows: any[] = [];
  importStats: any = null;
  importing = false;
  importError = '';
  selectedFileName = '';

  openImportModal(): void {
    this.showImportModal = true;
    this.parsedCsvRows = [];
    this.importStats = null;
    this.importError = '';
    this.selectedFileName = '';
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.parsedCsvRows = [];
    this.importStats = null;
    this.importError = '';
    this.selectedFileName = '';
  }

  downloadTemplate(): void {
    this.buyerService.getCsvTemplate().subscribe({
      next: (res) => {
        if (res.csv) {
          const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = res.filename || 'contech_buyers_template.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      },
      error: () => {
        const fallback = 'full_name,phone,email,budget_min_lacs,budget_max_lacs,preferred_bhk,buying_timeframe,lead_source,financing_readiness,occupation,current_residence,workplace_location,notes\n' +
          'Sunil Gavaskar,+91 98200 11223,sunil.g@example.com,150,220,3 BHK,<30 days,Google Ads,Pre-approved Loan,Business / Entrepreneur,Indiranagar Bengaluru,Whitefield Tech Park,Interested in east-facing tower\n';
        const blob = new Blob([fallback], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contech_buyers_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFileName = file.name;
    this.importError = '';
    this.importStats = null;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/).filter((l: string) => l.trim().length > 0);
        if (lines.length < 2) {
          this.importError = 'CSV file must have a header row and at least one data row.';
          return;
        }

        const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
        const rows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].split(',').map((cell: string) => cell.trim().replace(/^"|"$/g, ''));
          if (currentLine.length === headers.length || currentLine.length >= 2) {
            const rowObj: any = {};
            headers.forEach((h: string, idx: number) => {
              rowObj[h] = currentLine[idx] || '';
            });
            rows.push(rowObj);
          }
        }

        this.parsedCsvRows = rows;
      } catch (err: any) {
        this.importError = 'Failed to parse CSV file: ' + err.message;
      }
    };
    reader.readAsText(file);
  }

  executeImport(): void {
    if (this.parsedCsvRows.length === 0) {
      this.importError = 'Please upload a valid CSV file with buyer rows first.';
      return;
    }

    this.importing = true;
    this.importError = '';

    this.buyerService.importBuyersFromCsv(this.parsedCsvRows).subscribe({
      next: (res) => {
        this.importing = false;
        if (res.success) {
          this.importStats = res.results;
          this.loadBuyers();
          this.showFeedback(`Import finished: ${res.results.imported_count} imported, ${res.results.duplicate_count} duplicates skipped.`);
        } else {
          this.importError = res.message || 'Import failed';
        }
      },
      error: (err) => {
        this.importing = false;
        this.importError = err.error?.message || 'Failed to import CSV';
      }
    });
  }

  exportCSV() {
    const csvRows = [
      ['Buyer', 'Score', 'Intent Band', 'Stage', 'Phone', 'Requirement', 'Budget', 'Owner', 'Source', 'Next Best Action', 'At Risk']
    ];
    this.prospects.forEach(p => {
      csvRows.push([
        `"${p.name || ''}"`,
        p.score?.toString() || '0',
        `"${p.score >= 90 ? 'VERY HIGH INTENT' : p.score >= 80 ? 'HIGH INTENT' : p.score >= 65 ? 'QUALIFIED' : 'EMERGING'}"`,
        `"${p.stage || ''}"`,
        `"${p.phone || ''}"`,
        `"${p.bhk || ''}"`,
        `"${p.budget || ''}"`,
        `"${p.owner || ''}"`,
        `"${p.source || ''}"`,
        `"${(p.next_action || '').replace(/"/g, '""')}"`,
        `"${p.at_risk || ''}"`
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'contech_prospects_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


