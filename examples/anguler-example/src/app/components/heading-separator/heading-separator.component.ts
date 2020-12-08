import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'config-heading-separator',
  templateUrl: './heading-separator.component.html',
  styleUrls: ['./heading-separator.component.scss'],
})
export class HeadingSeparatorComponent {
  @Input() headingText: string;
  @Output() onAdd: EventEmitter<void> = new EventEmitter<void>();
}
