# Angular2 - Prosemirror component

This component is initally forked from [ng2-codemirror](https://github.com/chymz/ng2-codemirror) and ported to prosemirror.

### <a name="install"></a>Installation

- Install ng2-prosemirror
  - NPM : `npm install ng2-prosemirror`


### <a name="sample"></a>Sample

Include `ProsemirrorModule` in your main module :

```javascript
import { ProsemirrorModule } from 'ng2-prosemirror';

@NgModule({
  // ...
  imports:      [
    ProsemirrorModule
  ],
  // ...
})
export class AppModule { }
```

```javascript
import { Component } from 'angular2/core';

@Component({
  selector: 'sample',
  template: `
    <codemirror [(ngModel)]="code"
      [config]="{...}"
      (change)="onChange()"
      (blur)="onBlur()">
    </codemirror>
  `
})
export class Sample{
  constructor(){
    this.code = `// Some code...`; // Holding a markdown version of the content
  }

  onBlur() {
    // Called after every change, not debounced
    // this.code will not be updated at this time!
    // You probably use this function to flag the state of your code to "modified"
  }

  onChange() {
    // Called after every change, debounced every 1000ms.
    // this.code is updated now!
    // You probably use this function to store something and flag the state of your code to "stored"
  }

}
```

### <a name="config"></a>Configuration

* `config` : The configuration object for CodeMirror see http://codemirror.net/doc/manual.html#config

### <a name="licence"></a>Licence
See `LICENSE` file
