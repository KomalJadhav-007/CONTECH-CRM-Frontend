import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BuyerService } from '../buyer.service';

@Component({
  selector: 'app-buyer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buyer-list.component.html',
  styleUrl: './buyer-list.component.css'
})
export class BuyerListComponent implements OnInit {
  private buyerService = inject(BuyerService);

  loading = true;
  buyers: any[] = [];
  searchQuery = '';
  selectedUrgency = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.loadBuyers();
  }

  loadBuyers(): void {
    this.loading = true;
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedUrgency) params.urgency = this.selectedUrgency;
    if (this.selectedStatus) params.status = this.selectedStatus;

    this.buyerService.getBuyers(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.buyers = res.buyers;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadBuyers();
  }
}
