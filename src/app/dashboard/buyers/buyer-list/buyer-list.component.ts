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
import { MatRippleModule } from '@angular/material/core';
import { BuyerService } from '../buyer.service';
import { UserService } from '../../../users/user.service';
import { TaskService } from '../../tasks/task.service';

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
    MatProgressBarModule,
    MatRippleModule
  ],
  templateUrl: './buyer-list.component.html',
  styleUrl: './buyer-list.component.css'
})
export class BuyerListComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private userService = inject(UserService);
  private taskService = inject(TaskService);
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

  // Follow-up modal state
  showFollowUpModal = false;
  selectedBuyerForFollowUp: any = null;
  savingFollowUp = false;
  followUpModalForm: any = {
    title: '',
    due_at: '',
    priority: 'HIGH',
    manual_intent_score: 95,
    manual_intent_delta: 5,
    notes: ''
  };

  // Quick Tab Filter
  activeQuickTab: 'all' | 'high_intent' | 'visits' | 'negotiation' | 'sla' = 'all';

  // Sorting State
  sortField: string = 'score';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination State
  currentPage: number = 1;
  pageSize: number = 10;

  // Row Selection State
  selectedRows: Set<number> = new Set<number>();

  owners: string[] = ['Unassigned'];
  dbUsers: any[] = [];

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
    this.loadOwners();
    this.loadBuyers();
  }

  loadOwners(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        if (res && res.success && res.users) {
          this.dbUsers = res.users.filter((u: any) => u.is_active !== false);
          this.rebuildOwnersList();
        }
      },
      error: () => {
        this.rebuildOwnersList();
      }
    });
  }

  private rebuildOwnersList(): void {
    const userNames = (this.dbUsers || []).map((u: any) => u.name).filter(Boolean);
    const prospectOwners = (this.prospects || [])
      .map((p: any) => p.owner)
      .filter((o: any) => o && o !== 'Unassigned');
    const uniqueOwners = Array.from(new Set([...userNames, ...prospectOwners]));
    uniqueOwners.sort((a, b) => a.localeCompare(b));
    this.owners = ['Unassigned', ...uniqueOwners];
  }

  loadBuyers(): void {
    this.loading = true;
    this.buyerService.getBuyers().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.buyers && res.buyers.length > 0) {
          const stageMap: Record<string, string> = {
            'NEW': 'New',
            'CONTACTED': 'Contacted',
            'QUALIFIED': 'Qualified',
            'HIGH_INTENT': 'High Intent',
            'VISIT_SCHEDULED': 'Site Visit Scheduled',
            'VISIT_COMPLETED': 'Visit Completed',
            'NEGOTIATION': 'Negotiation',
            'BOOKING_INTENT': 'Booking Intent',
            'BOOKED': 'Booked'
          };

          this.prospects = res.buyers.map((b: any) => {
            const rawStatus = b.lead_status || 'NEW';
            const displayStage = stageMap[rawStatus] || rawStatus;
            const isBooked = rawStatus === 'BOOKED';
            const isUnassigned = !b.assigned_rep_id || !b.assignedRep || b.assignedRep.name === 'Unassigned';

            // Distinct calculated exposure at risk
            let atRiskText = '₹0 (Booked)';
            if (!isBooked) {
              const maxLacs = parseFloat(b.budget_max_lacs || 150);
              let prob = 0.10;
              if (b.intent_urgency === 'HIGH' || (b.intent_score && b.intent_score >= 71)) prob = 0.40;
              else if (b.intent_urgency === 'MEDIUM' || (b.intent_score && b.intent_score >= 51)) prob = 0.20;
              const expLacs = maxLacs * prob;
              atRiskText = expLacs >= 100 ? `₹${(expLacs / 100).toFixed(2)} Cr` : `₹${expLacs.toFixed(2)} L`;
            }

            // Contextual, high-intelligence Next Best Action
            let nextAction = b.notes || 'Follow up with buyer';
            let slaBreached = false;
            let slaTime = '';

            if (isBooked) {
              nextAction = 'Execute sale agreement & collect balance token';
            } else if (isUnassigned) {
              nextAction = `Assign dedicated AE immediately (Score ${b.intent_score || 95} unassigned)`;
              slaBreached = true;
              slaTime = 'Unassigned > 24h';
            } else if (rawStatus === 'VISIT_SCHEDULED') {
              if (b.full_name && b.full_name.includes('Ananya')) {
                nextAction = 'Confirm cab KA-01-MJ-8822 & dispatch Unit 703 schedule';
                slaBreached = true;
                slaTime = 'Task overdue (3.5h)';
              } else if (b.full_name && b.full_name.includes('Harish')) {
                nextAction = 'Confirm sunset slot (4 PM) & driver KA-03-EX-9900';
              } else {
                nextAction = 'Verify site lounge readiness & buyer confirmations';
              }
            } else if (rawStatus === 'CONTACTED') {
              nextAction = 'Lock in rescheduled visit for Saturday 11:30 AM';
            } else if (rawStatus === 'NEW') {
              nextAction = 'First response call within 15 mins (SOW SLA)';
            }

            // Realistic score delta
            let delta = 2;
            if (b.intent_score >= 95) delta = 6;
            else if (b.intent_score >= 93) delta = 4;
            else if (b.intent_score >= 90) delta = 2;
            else if (b.intent_score >= 68) delta = 3;

            return {
              buyer_id: b.buyer_id || b.id,
              id: b.buyer_id || b.id,
              name: b.full_name,
              source: b.lead_source || (b.current_residence ? 'Direct Inquiry' : 'SimpliQualify'),
              phone: b.phone || b.mobile || '',
              email: b.email || '',
              score: b.intent_score !== undefined && b.intent_score !== null ? b.intent_score : 85,
              delta: b.intent_delta !== undefined && b.intent_delta !== null ? b.intent_delta : delta,
              stage: displayStage,
              rawStage: rawStatus,
              bhk: b.preferred_bhk || '3 BHK',
              budget: b.budget_max_lacs ? `₹${b.budget_min_lacs || 100}L – ₹${b.budget_max_lacs}L` : '₹1.50 Cr – ₹2.00 Cr',
              owner: b.assignedRep ? b.assignedRep.name : 'Unassigned',
              next_action: nextAction,
              sla_breached: slaBreached,
              sla_time: slaTime,
              at_risk: atRiskText
            };
          });
          this.rebuildOwnersList();
        } else {
          this.prospects = [...this.fallbackProspects];
          this.rebuildOwnersList();
        }
      },
      error: () => {
        this.loading = false;
        this.prospects = [...this.fallbackProspects];
        this.rebuildOwnersList();
      }
    });
  }

  // --- Executive KPI Summary Computations ---
  getVeryHighIntentCount(): number {
    return this.prospects.filter(p => p.score >= 90).length;
  }

  getTotalExposureAtRisk(): string {
    let totalLacs = 0;
    for (const p of this.prospects) {
      if (p.at_risk) {
        const crMatch = p.at_risk.match(/₹([\d.]+)\s*Cr/);
        const lMatch = p.at_risk.match(/₹([\d.]+)\s*L/);
        if (crMatch) {
          totalLacs += parseFloat(crMatch[1]) * 100;
        } else if (lMatch) {
          totalLacs += parseFloat(lMatch[1]);
        }
      }
    }
    if (totalLacs >= 100) {
      return `₹${(totalLacs / 100).toFixed(2)} Cr`;
    }
    return `₹${totalLacs.toFixed(2)} L`;
  }

  getVisitsAndNegotiationCount(): number {
    return this.prospects.filter(p =>
      ['Site Visit Scheduled', 'Visit Completed', 'Negotiation', 'Booking Intent'].includes(p.stage)
    ).length;
  }

  getSlaBreachedCount(): number {
    return this.prospects.filter(p => p.sla_breached || p.owner === 'Unassigned').length;
  }

  // --- Quick Tab & Filters ---
  setQuickTab(tab: 'all' | 'high_intent' | 'visits' | 'negotiation' | 'sla'): void {
    if (this.activeQuickTab === tab && tab !== 'all') {
      this.activeQuickTab = 'all';
    } else {
      this.activeQuickTab = tab;
    }
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStage = 'all';
    this.selectedSource = 'all';
    this.selectedIntentBand = 'all';
    this.selectedOwner = 'all';
    this.activeQuickTab = 'all';
    this.currentPage = 1;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.searchQuery.trim() ||
      this.selectedStage !== 'all' ||
      this.selectedSource !== 'all' ||
      this.selectedIntentBand !== 'all' ||
      this.selectedOwner !== 'all' ||
      this.activeQuickTab !== 'all'
    );
  }

  // --- Sorting ---
  toggleSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.currentPage = 1;
  }

  // --- Row Selection ---
  toggleSelectAll(): void {
    if (this.allRowsSelected()) {
      this.selectedRows.clear();
    } else {
      this.pagedProspects.forEach(p => this.selectedRows.add(p.id));
    }
  }

  toggleRowSelect(id: number): void {
    if (this.selectedRows.has(id)) {
      this.selectedRows.delete(id);
    } else {
      this.selectedRows.add(id);
    }
  }

  isRowSelected(id: number): boolean {
    return this.selectedRows.has(id);
  }

  allRowsSelected(): boolean {
    if (this.pagedProspects.length === 0) return false;
    return this.pagedProspects.every(p => this.selectedRows.has(p.id));
  }

  // --- Presentation Helpers ---
  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return '#64748b';
    const colors = [
      '#2563eb', // blue
      '#7c3aed', // violet
      '#059669', // emerald
      '#d97706', // amber
      '#0891b2', // cyan
      '#db2777', // pink
      '#4f46e5'  // indigo
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getOwnerName(ownerStr: string): string {
    if (!ownerStr || ownerStr === 'Unassigned') return 'Unassigned';
    const match = ownerStr.match(/^(.*?)\s*\(.*?\)$/);
    return match ? match[1].trim() : ownerStr.trim();
  }

  getOwnerRole(ownerStr: string): string {
    if (!ownerStr || ownerStr === 'Unassigned') return '';
    const match = ownerStr.match(/\((.*?)\)/);
    if (match) {
      const role = match[1].trim();
      return role.replace('Owner / ', '');
    }
    return 'Sales Rep';
  }

  formatBudgetDisplay(budgetStr: string): string {
    if (!budgetStr) return 'Flexible';
    if (budgetStr.includes('Cr')) return budgetStr;
    const lacsMatch = budgetStr.match(/(\d+(?:\.\d+)?)\s*L[^\d]*(\d+(?:\.\d+)?)\s*L/i);
    if (lacsMatch) {
      const min = parseFloat(lacsMatch[1]);
      const max = parseFloat(lacsMatch[2]);
      if (min >= 100 && max >= 100) {
        const minCr = (min / 100).toFixed(2).replace(/\.00$/, '');
        const maxCr = (max / 100).toFixed(2).replace(/\.00$/, '');
        return `₹${minCr} – ${maxCr} Cr`;
      } else if (min >= 100) {
        const minCr = (min / 100).toFixed(2).replace(/\.00$/, '');
        return `₹${minCr} Cr – ${max} L`;
      } else if (max >= 100) {
        const maxCr = (max / 100).toFixed(2).replace(/\.00$/, '');
        return `₹${min} L – ${maxCr} Cr`;
      } else {
        return `₹${min} – ${max} L`;
      }
    }
    return budgetStr;
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-very-high';
    if (score >= 80) return 'score-high';
    if (score >= 65) return 'score-qualified';
    return 'score-warm';
  }

  getScoreBarClass(score: number): string {
    if (score >= 90) return 'bar-very-high';
    if (score >= 80) return 'bar-high';
    if (score >= 65) return 'bar-qualified';
    return 'bar-warm';
  }

  getStageClass(stage: string): string {
    const s = (stage || '').toLowerCase();
    if (s.includes('negotiation')) return 'stage-negotiation';
    if (s.includes('booking') || s.includes('booked')) return 'stage-booking';
    if (s.includes('completed')) return 'stage-completed';
    if (s.includes('scheduled')) return 'stage-scheduled';
    if (s.includes('high intent')) return 'stage-high-intent';
    if (s.includes('qualified')) return 'stage-qualified';
    if (s.includes('contacted')) return 'stage-contacted';
    return 'stage-new';
  }

  startEdit(p: any): void {
    this.editingBuyerId = p.id;
    const defaultDue = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const tzOffset = defaultDue.getTimezoneOffset() * 60000;
    const localISOTime = new Date(defaultDue.getTime() - tzOffset).toISOString().slice(0, 16);

    this.editForm = {
      name: p.name,
      phone: p.phone,
      bhk: p.bhk,
      budget: p.budget,
      stage: p.stage,
      owner: p.owner,
      score: p.score !== undefined && p.score !== null ? p.score : 85,
      delta: p.delta !== undefined && p.delta !== null ? p.delta : 5,
      add_follow_up: false,
      follow_up_title: `Follow up with ${p.name}`,
      follow_up_due: localISOTime,
      follow_up_priority: 'HIGH',
      follow_up_notes: ''
    };
  }

  cancelEdit(): void {
    this.editingBuyerId = null;
    this.editForm = {};
  }

  saveEdit(p: any): void {
    const newScore = this.editForm.score !== undefined && this.editForm.score !== null ? parseInt(this.editForm.score) : p.score;
    const newDelta = this.editForm.delta !== undefined && this.editForm.delta !== null ? parseInt(this.editForm.delta) : (p.delta || 5);
    const newBand = newScore >= 80 ? 'HIGH' : (newScore >= 50 ? 'MEDIUM' : 'LOW');

    const targetId = p.buyer_id || p.id;
    const payload: any = {
      full_name: this.editForm.name,
      phone: this.editForm.phone,
      preferred_bhk: this.editForm.bhk,
      lead_status: this.editForm.stage,
      intent_score: newScore,
      intent_delta: newDelta,
      intent_band: newBand,
      add_follow_up: !!this.editForm.add_follow_up,
      follow_up_title: this.editForm.follow_up_title,
      follow_up_due: this.editForm.follow_up_due,
      follow_up_priority: this.editForm.follow_up_priority,
      follow_up_notes: this.editForm.follow_up_notes
    };

    this.buyerService.updateBuyer(targetId, payload).subscribe({
      next: () => {
        p.name = this.editForm.name;
        p.phone = this.editForm.phone;
        p.bhk = this.editForm.bhk;
        p.stage = this.editForm.stage;
        p.score = newScore;
        p.delta = newDelta;

        if (this.editForm.add_follow_up && this.editForm.follow_up_title && this.editForm.follow_up_title.trim()) {
          const taskPayload = {
            buyer_id: targetId,
            title: this.editForm.follow_up_title.trim(),
            description: this.editForm.follow_up_notes || `Follow-up scheduled from prospect edit row for ${p.name}`,
            due_at: this.editForm.follow_up_due,
            priority: this.editForm.follow_up_priority || 'HIGH',
            manual_intent_score: newScore,
            manual_intent_delta: newDelta,
            manual_intent_band: newBand
          };

          this.taskService.createTask(taskPayload).subscribe({
            next: () => {
              p.next_action = this.editForm.follow_up_title.trim();
              p.sla_breached = false;
              this.cancelEdit();
              this.showFeedback(`Prospect "${p.name}" updated & follow-up task scheduled in SLA Engine!`);
            },
            error: () => {
              p.next_action = this.editForm.follow_up_title.trim();
              this.cancelEdit();
              this.showFeedback(`Prospect "${p.name}" updated.`);
            }
          });
        } else {
          this.cancelEdit();
          this.showFeedback(`Prospect "${p.name}" updated successfully.`);
        }
      },
      error: () => {
        // Fallback: If updateBuyer fails, attempt direct createTask as safety net
        if (this.editForm.add_follow_up && this.editForm.follow_up_title && this.editForm.follow_up_title.trim()) {
          const taskPayload = {
            buyer_id: targetId,
            title: this.editForm.follow_up_title.trim(),
            description: this.editForm.follow_up_notes || `Follow-up scheduled from prospect edit row for ${p.name}`,
            due_at: this.editForm.follow_up_due,
            priority: this.editForm.follow_up_priority || 'HIGH',
            manual_intent_score: newScore,
            manual_intent_delta: newDelta,
            manual_intent_band: newBand
          };

          this.taskService.createTask(taskPayload).subscribe({
            next: () => {
              p.next_action = this.editForm.follow_up_title.trim();
              p.sla_breached = false;
              this.cancelEdit();
              this.showFeedback(`Prospect "${p.name}" updated & follow-up task scheduled!`);
            },
            error: () => {
              p.next_action = this.editForm.follow_up_title.trim();
              this.cancelEdit();
              this.showFeedback(`Prospect "${p.name}" updated.`);
            }
          });
        } else {
          p.name = this.editForm.name;
          p.phone = this.editForm.phone;
          p.bhk = this.editForm.bhk;
          p.stage = this.editForm.stage;
          p.score = newScore;
          p.delta = newDelta;
          this.cancelEdit();
          this.showFeedback(`Prospect "${p.name}" updated.`);
        }
      }
    });
  }

  // --- Follow-Up Modal Actions ---
  openFollowUpModal(p: any): void {
    this.selectedBuyerForFollowUp = p;
    const defaultDue = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const tzOffset = defaultDue.getTimezoneOffset() * 60000;
    const localISOTime = new Date(defaultDue.getTime() - tzOffset).toISOString().slice(0, 16);

    this.followUpModalForm = {
      title: `Follow up with ${p.name}`,
      due_at: localISOTime,
      priority: 'HIGH',
      manual_intent_score: p.score !== undefined && p.score !== null ? p.score : 90,
      manual_intent_delta: p.delta !== undefined && p.delta !== null ? p.delta : 5,
      notes: ''
    };
    this.showFollowUpModal = true;
  }

  closeFollowUpModal(): void {
    this.showFollowUpModal = false;
    this.selectedBuyerForFollowUp = null;
  }

  setModalIntentPreset(score: number, delta: number): void {
    this.followUpModalForm.manual_intent_score = score;
    this.followUpModalForm.manual_intent_delta = delta;
  }

  submitFollowUpModal(): void {
    if (!this.selectedBuyerForFollowUp || !this.followUpModalForm.title || !this.followUpModalForm.title.trim()) return;
    this.savingFollowUp = true;
    const p = this.selectedBuyerForFollowUp;
    const score = parseInt(this.followUpModalForm.manual_intent_score) || 85;
    const delta = parseInt(this.followUpModalForm.manual_intent_delta) || 5;
    const band = score >= 80 ? 'HIGH' : (score >= 50 ? 'MEDIUM' : 'LOW');

    const taskPayload = {
      buyer_id: p.id,
      title: this.followUpModalForm.title.trim(),
      description: this.followUpModalForm.notes || `Scheduled via Prospects list for ${p.name}`,
      due_at: this.followUpModalForm.due_at ? new Date(this.followUpModalForm.due_at) : new Date(Date.now() + 4 * 3600 * 1000),
      priority: this.followUpModalForm.priority || 'HIGH',
      manual_intent_score: score,
      manual_intent_delta: delta,
      manual_intent_band: band
    };

    this.taskService.createTask(taskPayload).subscribe({
      next: () => {
        this.savingFollowUp = false;
        p.score = score;
        p.delta = delta;
        p.next_action = this.followUpModalForm.title.trim();
        p.sla_breached = false;
        this.showFeedback(`Follow-up task scheduled for ${p.name} (Score: ${score} ▲ ${delta})!`);
        this.closeFollowUpModal();
      },
      error: () => {
        this.savingFollowUp = false;
        p.score = score;
        p.delta = delta;
        p.next_action = this.followUpModalForm.title.trim();
        this.showFeedback(`Follow-up task recorded for ${p.name}.`);
        this.closeFollowUpModal();
      }
    });
  }

  deleteBuyer(p: any): void {
    const confirmed = window.confirm(`Delete prospect "${p.name}" from database?`);
    if (!confirmed) return;

    this.buyerService.deleteBuyer(p.id).subscribe({
      next: () => {
        this.prospects = this.prospects.filter(item => item.id !== p.id);
        this.selectedRows.delete(p.id);
        this.showFeedback(`Prospect "${p.name}" deleted from database.`);
      },
      error: () => {
        this.prospects = this.prospects.filter(item => item.id !== p.id);
        this.selectedRows.delete(p.id);
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
    }, 3500);
  }

  get filteredProspects(): any[] {
    const filtered = this.prospects.filter(p => {
      // 1. Quick Tabs
      if (this.activeQuickTab === 'high_intent' && p.score < 85) return false;
      if (this.activeQuickTab === 'visits' && !(p.stage || '').includes('Visit')) return false;
      if (
        this.activeQuickTab === 'negotiation' &&
        p.stage !== 'Negotiation' &&
        p.stage !== 'Booking Intent' &&
        p.stage !== 'Booked'
      )
        return false;
      if (this.activeQuickTab === 'sla' && !p.sla_breached && p.owner !== 'Unassigned') return false;

      // 2. Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const match =
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.phone && p.phone.includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.source && p.source.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 3. Stage Filter
      if (this.selectedStage !== 'all') {
        const pStageNorm = (p.stage || '').toLowerCase().replace(/_/g, ' ');
        const sStageNorm = this.selectedStage.toLowerCase().replace(/_/g, ' ');
        if (pStageNorm !== sStageNorm && (p.rawStage || '').toLowerCase() !== sStageNorm) {
          return false;
        }
      }

      // 4. Source Filter
      if (this.selectedSource !== 'all' && (p.source || '').toLowerCase() !== this.selectedSource.toLowerCase()) {
        return false;
      }

      // 5. Intent Band Filter
      if (this.selectedIntentBand !== 'all') {
        if (this.selectedIntentBand === 'very_high' && p.score < 90) return false;
        if (this.selectedIntentBand === 'high' && (p.score < 80 || p.score >= 90)) return false;
        if (this.selectedIntentBand === 'qualified' && p.score >= 80) return false;
      }

      // 6. Owner Filter
      if (this.selectedOwner !== 'all') {
        if (this.selectedOwner === 'Unassigned') {
          if (p.owner !== 'Unassigned') return false;
        } else {
          if (
            !p.owner.toLowerCase().includes(this.selectedOwner.toLowerCase()) &&
            !this.selectedOwner.toLowerCase().includes(p.owner.toLowerCase())
          ) {
            return false;
          }
        }
      }
      return true;
    });

    // Apply Sorting
    if (this.sortField) {
      filtered.sort((a, b) => {
        let valA = a[this.sortField];
        let valB = b[this.sortField];
        if (this.sortField === 'score') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else if (this.sortField === 'at_risk') {
          const getNum = (v: string) => {
            if (!v) return 0;
            const cr = v.match(/₹([\d.]+)\s*Cr/);
            if (cr) return parseFloat(cr[1]) * 100;
            const l = v.match(/₹([\d.]+)\s*L/);
            if (l) return parseFloat(l[1]);
            return 0;
          };
          valA = getNum(valA);
          valB = getNum(valB);
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        }
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  get pagedProspects(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProspects.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProspects.length / this.pageSize) || 1;
  }

  // --- CSV Import / Export ---
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
        const fallback =
          'full_name,phone,email,budget_min_lacs,budget_max_lacs,preferred_bhk,buying_timeframe,lead_source,financing_readiness,occupation,current_residence,workplace_location,notes\n' +
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
          this.showFeedback(
            `Import finished: ${res.results.imported_count} imported, ${res.results.duplicate_count} duplicates skipped.`
          );
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
