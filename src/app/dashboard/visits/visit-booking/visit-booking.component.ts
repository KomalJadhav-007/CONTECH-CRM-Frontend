import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VisitService } from '../visit.service';
import { BuyerService } from '../../buyers/buyer.service';

@Component({
  selector: 'app-visit-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './visit-booking.component.html',
  styleUrl: './visit-booking.component.css'
})
export class VisitBookingComponent implements OnInit {
  private visitService = inject(VisitService);
  private buyerService = inject(BuyerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  buyers: any[] = [
    { id: 1, full_name: 'Sneha Kulkarni', phone: '+91 98765 43211', preferred_bhk: '3 BHK' },
    { id: 2, full_name: 'Anand Bhagat', phone: '+91 98765 43212', preferred_bhk: '4 BHK' },
    { id: 3, full_name: 'Deepa Sharma', phone: '+91 98765 43218', preferred_bhk: '3 BHK' },
    { id: 4, full_name: 'Rahul Deshmukh', phone: '+91 98765 43210', preferred_bhk: '3 BHK' },
    { id: 5, full_name: 'Neha Agarwal', phone: '+91 98765 43215', preferred_bhk: '4 BHK' },
    { id: 6, full_name: 'Harish Menon', phone: '+91 98765 43239', preferred_bhk: '4 BHK' }
  ];

  bookingData = {
    buyer_id: 1,
    project_id: 1,
    sales_rep_id: 3,
    driver_id: 5,
    scheduled_date: new Date().toISOString().split('T')[0],
    time_slot: '11:00 AM - 12:30 PM (Peak Slot)',
    cab_required: true,
    cab_number: 'KA-01-MJ-8822',
    pickup_address: 'Customer Residence / Office',
    notes: 'Confirm buyer preferred floor plan copies ready in sales lounge.'
  };

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.buyerService.getBuyers().subscribe({
      next: (res) => {
        if (res.success && res.buyers && res.buyers.length > 0) {
          this.buyers = res.buyers;
        }
        const qBuyerId = this.route.snapshot.queryParamMap.get('buyer_id');
        if (qBuyerId) {
          this.bookingData.buyer_id = parseInt(qBuyerId, 10);
        } else if (this.buyers.length > 0) {
          this.bookingData.buyer_id = this.buyers[0].id;
        }
      },
      error: () => {
        // Fallback to local buyers
        const qBuyerId = this.route.snapshot.queryParamMap.get('buyer_id');
        if (qBuyerId) {
          this.bookingData.buyer_id = parseInt(qBuyerId, 10);
        }
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.visitService.bookSiteVisit(this.bookingData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/visits']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to book site visit. Capacity limit or conflict.';
      }
    });
  }
}
