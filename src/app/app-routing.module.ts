import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MoleScreenComponent } from './mole-screen/mole-screen.component';
import { PaintScreenComponent } from './paint-screen/paint-screen.component';
import { PictionaryComponent } from './pictionary/pictionary.component';

const routes: Routes = [
  { path: "", component: MoleScreenComponent },
  { path: "paint", component: PaintScreenComponent },
  { path: "pictionary", component: PictionaryComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
