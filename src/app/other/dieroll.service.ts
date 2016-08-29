import { EventEmitter } from '@angular/core';

export class DieRollService {
    rollEvent = new EventEmitter<boolean>();
    rollFinishedEvent = new EventEmitter<boolean>();

    roll() {
        this.rollEvent.emit(true);
    }

    rollFinished() {
        this.rollFinishedEvent.emit(true);
    }
}
