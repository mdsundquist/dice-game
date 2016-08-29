import { Component, OnInit } from '@angular/core';
import { DieRollService } from '../other/dieroll.service';
import { TurnService } from '../other/turn.service';

@Component({
  moduleId: module.id,
  selector: 'dice-messages',
  template: `<div><span><h5>{{displayMsg}}</h5></span></div>`,
  styles: [`h5 {
                color: red;
            }
            div {
                height: 50px;
                line-height: 50px;
                text-align: center;
            }
            span {
                width: 600px;
                display: inline-block;
                vertical-align: middle;
                line-height: normal;
            }`]
})
export class MessagesComponent implements OnInit {
  displayMsg: string;
  rollNumber: number;

  messages = {
      'newGame': `Click the 'Roll' button to begin the game.`,
      'beforeRollOne': `FIRST ROLL: click the 'Roll' button to begin the turn.`,
      'beforeRollTwo': `SECOND ROLL: Toggle the 'Hold' button under any die to keep it, 
                        then click 'Roll' to roll the rest. Alternatively, score the
                        turn and click 'Next Turn'`,
      'beforeRollThree': `LAST ROLL: Toggle the 'Hold' button under any die to keep/roll it, 
                        then click 'Roll'. Alternatively, score the turn and click 'Next Turn'`,
      'afterRollThree': `Score the turn and click 'Roll' to begin your next turn`
  };

constructor(private rollService: DieRollService, private turnService: TurnService) {
      this.rollNumber = 1;
      this.resetMessage();
  }

  ngOnInit() {
  //  Event subscriptions
      this.turnService.advanceRollEvent.subscribe(
          data => {
              this.rollNumber = data;
              if (data === 2) this.displayMsg = this.messages.beforeRollTwo;
              else if (data === 3) this.displayMsg = this.messages.beforeRollThree;
          }
      );
      this.turnService.newTurnEvent.subscribe(
          data => {
              if (data) {
                  this.rollNumber = 1;
                  this.displayMsg = this.messages.beforeRollOne;
              }
          }
      )
      this.rollService.rollFinishedEvent.subscribe(
          data => {
              if (data) {
                  if (this.rollNumber === 3) this.displayMsg = this.messages.afterRollThree;
              }
          }
      );
  }

  resetMessage() {
      this.displayMsg = this.messages.beforeRollOne;
  }
}
