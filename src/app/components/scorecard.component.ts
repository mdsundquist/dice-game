import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';


const TOP_BONUS_THRESHOLD = 63;

@Component({
    moduleId: module.id,
    selector: 'dice-scorecard',
    templateUrl: 'scorecard.component.html',
    styleUrls: ['scorecard.component.css'],
})

export class ScorecardComponent {
    title: string = 'Scorecard';
    points = {
        fullHouse: 25,
        straightSm: 30,
        straightLg: 40,
        fiveOAK: 50,
        bonus: {
            top: 35,
            fiveOAK: 100
        }
    };
    score = {
        aces: '',
        twos: '',
        threes: '',
        fours: '',
        fives: '',
        sixes: '',
        topBonus: 0,
        threeOAK: '',
        fourOAK: '',
        fullHouse: '',
        straightSm: '',
        straightLg: '',
        fiveOAK: '',
        wild: '',
        fiveOAKBonus: '',
    };
    totals = {
        topSubtotal: 0,
        topTotal: 0,
        bottomTotal: 0,
        grandTotal: 0
    };

    constructor() {
        this.resetScore();
    }

    resetScore() {
        for (let property in this.score) {
            if (this.score.hasOwnProperty(property))
                property = '0';
        }
        for (let property in this.totals) {
            if (this.totals.hasOwnProperty(property))
                property = '0';
        }
    }

    calculateTopScore(): number {
        this.totals.topSubtotal = 
            (isNaN(parseInt(this.score.aces)) ? 0 : parseInt(this.score.aces)) +
            (isNaN(parseInt(this.score.twos)) ? 0 : parseInt(this.score.twos)) +
            (isNaN(parseInt(this.score.threes)) ? 0 : parseInt(this.score.threes)) +
            (isNaN(parseInt(this.score.fours)) ? 0 : parseInt(this.score.fours)) + 
            (isNaN(parseInt(this.score.fives)) ? 0 : parseInt(this.score.fives)) +
            (isNaN(parseInt(this.score.sixes)) ? 0 : parseInt(this.score.sixes));
        if (this.totals.topSubtotal >= TOP_BONUS_THRESHOLD)
            this.score.topBonus = this.points.bonus.top;
        this.totals.topTotal = this.totals.topSubtotal + this.score.topBonus;
        return this.totals.topTotal;
    }

    calculateBottomScore(): number {
        this.totals.bottomTotal = 
            (isNaN(parseInt(this.score.threeOAK)) ? 0 : parseInt(this.score.threeOAK)) + 
            (isNaN(parseInt(this.score.fourOAK)) ? 0 : parseInt(this.score.fourOAK)) + 
            (isNaN(parseInt(this.score.fullHouse)) ? 0 : parseInt(this.score.fullHouse)) +
            (isNaN(parseInt(this.score.straightSm)) ? 0 : parseInt(this.score.straightSm)) +
            (isNaN(parseInt(this.score.straightLg)) ? 0 : parseInt(this.score.straightLg)) + 
            (isNaN(parseInt(this.score.fiveOAK)) ? 0 : parseInt(this.score.fiveOAK)) +
            (isNaN(parseInt(this.score.wild)) ? 0 : parseInt(this.score.wild)) + 
            (isNaN(parseInt(this.score.fiveOAKBonus)) ? 0 : parseInt(this.score.fiveOAKBonus));
        return this.totals.bottomTotal;
    }

    onSubmit(scoreForm: NgForm) {
        console.log(scoreForm);
        this.totals.grandTotal = this.calculateTopScore() + this.calculateBottomScore();
    }
}
