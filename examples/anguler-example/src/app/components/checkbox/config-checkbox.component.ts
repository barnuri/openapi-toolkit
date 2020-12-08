import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
@Component({
    selector: 'config-checkbox',
    templateUrl: './config-checkbox.component.html',
    styleUrls: ['./config-checkbox.component.scss']
})
export class ConfigCheckboxComponent implements OnInit {
    @Input() value;
    @Output() change: EventEmitter<any> = new EventEmitter<any>();

    constructor() {}
    ngOnInit(): void {
        if (Array.isArray(this.value)) {
            this.value = this.value[0];
        }
    }

    toggleValue() {
        this.value = !this.value;
        this.change.emit({
            target: {
                value: this.value
            }
        });
    }
}
