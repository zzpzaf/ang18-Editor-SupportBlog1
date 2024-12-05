import { ComponentRef, Directive, effect, input, ViewContainerRef } from '@angular/core';
import { DynLayOutComponents } from './objects/blogObjects';

const ComponentName = 'AddCompDynDirective';
@Directive({
  selector: '[addCompDyn]',
  standalone: true,
})
export class AddCompDynDirective {
  
  compToken = input.required<string>();
  private componentRef!: ComponentRef<any>;

  constructor(public viewContainerRef: ViewContainerRef) {
    effect(() => {
      const layOutCompSelected = this.compToken();
      if (!layOutCompSelected) {
        return;
      }
      this.viewContainerRef.clear();
      const dynComponent = DynLayOutComponents[layOutCompSelected];
      this.viewContainerRef.createComponent(dynComponent);
    });
  }
}

