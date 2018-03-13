import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractOutsideDirective } from './directives/interact-outside.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [InteractOutsideDirective],
  exports: [InteractOutsideDirective]
})
export class InteractOutsideModule { }
