import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BuyerService } from '../buyer.service';

@Component({
  selector: 'app-buyer-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-details.component.html',
  styleUrl: './buyer-details.component.css'
})
export class BuyerDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private buyerService = inject(BuyerService);

  buyerId!: number;
  buyer: any = null;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.buyerId = parseInt(id, 10);
      this.loadBuyerDossier();
    }
  }

  loadBuyerDossier(): void {
    this.loading = true;
    this.buyerService.getBuyer360(this.buyerId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.buyer = res.buyer;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
