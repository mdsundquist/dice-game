import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppComponent, environment } from './app/';
import { DieRollService } from './app/other/dieroll.service';
import { TurnService } from './app/other/turn.service';

if (environment.production) {
  enableProdMode();
}

bootstrap(AppComponent, [DieRollService, TurnService]);
