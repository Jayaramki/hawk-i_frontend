import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isActive" class="tab-panel">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .tab-panel {
      @apply w-full;
    }
  `]
})
export class TabPanelComponent {
  @Input() id: string = '';
  @Input() isActive: boolean = false;
}
