import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { DieRollService } from './dieroll.service';

const MAX_TURNS: number = 3;

@Injectable()
export class TurnService implements OnInit {
    newTurnEvent = new EventEmitter<boolean>();
    advanceRollEvent = new EventEmitter<number>();
    private turnNumber: number;

    constructor(private dieRollService: DieRollService) {
        this.turnNumber = 1;
     }

    ngOnInit() {
        this.dieRollService.rollFinishedEvent.subscribe(
            data => {
                if (data) this.advanceRoll();
            }
        );
    }

    advanceRoll() {
        this.turnNumber = (this.turnNumber === MAX_TURNS) ? 1 : this.turnNumber + 1;
        this.advanceRollEvent.emit(this.turnNumber);
    } 

    newTurn() {
        this.turnNumber = 1;
        this.newTurnEvent.emit(true);
    }
}
