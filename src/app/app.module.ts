import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MoleScreenComponent } from './mole-screen/mole-screen.component';
import { PaintScreenComponent } from './paint-screen/paint-screen.component';
import { PictionaryComponent } from './pictionary/pictionary.component';

@NgModule({
  declarations: [
    AppComponent,
    MoleScreenComponent,
    PaintScreenComponent,
    PictionaryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
