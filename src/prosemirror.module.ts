import { NgModule } from '@angular/core';

import { ProsemirrorComponent } from './prosemirror.component';

/**
 * CodemirrorModule
 */
@NgModule({
  declarations: [
    ProsemirrorComponent,
  ],
  exports: [
    ProsemirrorComponent,
  ]
})

export class ProsemirrorModule{}
