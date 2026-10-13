import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessControlViewComponent } from './access-control-view/access-control-view.component';

@NgModule({
  imports: [
    CommonModule,
    AccessControlViewComponent
  ],
  exports: [
    AccessControlViewComponent
  ]
})
export class AccessControlModule {}
