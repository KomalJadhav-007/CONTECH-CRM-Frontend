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

  buyers: any[] = [];
  bookingData = {
    buyer_id: 1,
    project_id: 1,
    sales_rep_id: 3,
    driver_id: 5,
    scheduled_date: new Date().toISOString().split('T')[0],
    time_slot: '11:00 AM - 12:30 PM',
    cab_required: true,
    cab_number: 'KA-01-MJ-8822',
    pickup_address: 'Customer Residence / Office',
    notes: 'Confirm buyer preferred floor plan copies ready in sales lounge.'
  };

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.buyerService.getBuyers().subscribe(res => {
      if (res.success) {
        this.buyers = res.buyers;
        const qBuyerId = this.route.snapshot.queryParamMap.get('buyer_id');
        if (qBuyerId) {
          this.bookingData.buyer_id = parseInt(qBuyerId, 10);
        } else if (this.buyers.length > 0) {
          this.bookingData.buyer_id = this.buyers[0].id;
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
