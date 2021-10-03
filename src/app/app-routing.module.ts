import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MoleScreenComponent } from './mole-screen/mole-screen.component';

const routes: Routes = [
  { path: "", component: MoleScreenComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
