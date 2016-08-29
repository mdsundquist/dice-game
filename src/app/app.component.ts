import { Component, OnInit } from '@angular/core';
import { D6Component, MessagesComponent, ScorecardComponent } from './components';
import { DieRollService } from './other/dieroll.service';
import { TurnService } from './other/turn.service';

@Component({
  moduleId: module.id,
  selector: 'dice-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [D6Component, MessagesComponent, ScorecardComponent]
})
export class AppComponent implements OnInit {
    title: string = 'DICE POKER!';
    firstRoll: boolean = true;
    turnBtnClass: string = 'turnBtnDisabled';

    constructor(private dieRollService: DieRollService, private turnService: TurnService) {}

    ngOnInit() {
    //  Event subscriptions
        this.turnService.newTurnEvent.subscribe(
            data => {
                if (data) this.firstRoll = true;
                this.turnBtnClass = 'turnBtnDisabled';
            }
        );
        this.turnService.advanceRollEvent.subscribe(
            data => {
                if (data === 1) {
                    this.firstRoll = true;
                    this.turnBtnClass = 'turnBtnDisabled';
                } else {
                    this.firstRoll = false;
                    this.turnBtnClass = 'turnBtnEnabled';
                }
            }
        );
    }

    onRollClick() {
        let that = this;
        this.dieRollService.roll();
        setTimeout(function() {
            that.dieRollService.rollFinished();
            that.turnService.advanceRoll();
        }, 1600);

    }

    onNextTurnClick() {
        this.turnService.newTurn();
    }

}
