import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MoleScreenComponent } from './mole-screen/mole-screen.component';
import { PaintScreenComponent } from './paint-screen/paint-screen.component';

const routes: Routes = [
  { path: "", component: MoleScreenComponent },
  { path: "paint", component: PaintScreenComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
