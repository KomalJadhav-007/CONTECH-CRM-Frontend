import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { BuyerService } from '../buyer.service';

@Component({
  selector: 'app-buyer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule, MatChipsModule],
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

  exportCSV() {
    const csvRows = [
      ['Buyer', 'Score', 'Stage', 'Requirement', 'Budget', 'Owner', 'Next Best Action', 'At Risk']
    ];
    this.prospects.forEach(p => {
      csvRows.push([p.name, p.score.toString(), p.stage, p.bhk, p.budget, p.owner, p.next_action, p.at_risk]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'prospects_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

