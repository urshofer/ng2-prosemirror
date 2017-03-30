// Imports
import {
  Component,
  Input,
  Output,
  ElementRef,
  ViewChild,
  EventEmitter,
  forwardRef
} from '@angular/core';



import {EditorView}          from "prosemirror-view"
import {EditorState}         from "prosemirror-state"
import {exampleSetup}        from "prosemirror-example-setup"

import {schema, defaultMarkdownParser, defaultMarkdownSerializer} from  "prosemirror-markdown"

/**
 * Prosemirror component
 * Usage :
 * <prosemirror [(ngModel)]="data" [config]="{...}"></prosemirror>
 */
@Component({
  selector: 'prosemirror',
  template: `<div #host></div>`,
})
export class ProsemirrorComponent {

  @Input() data: any;
  @Output() dataChange: EventEmitter<number>;

  @Input() config;
  @Output() change = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();

  @ViewChild('host') host;

  @Output() instance = null;


  /**
   * Constructor
   */
  constructor(){
    //this.count = 0;
    this.dataChange = new EventEmitter<number>();
  }

  /**
   * On component destroy
   */
  ngOnDestroy(){

  }

  /**
   * On component view init
   */
  ngAfterViewInit(){
    this.config = this.config || {};
    this.prosemirrorInit(this.config);
  }

  /**
   * Initialize prosemirror
   */
  prosemirrorInit(config){

    console.log(`P R O S E M I R R O R`)
    console.log(`Setting up: ${this.host.nativeElement}`);
    console.log(`Parsing:    ${this.data}`);

    this.instance = new EditorView(this.host.nativeElement, {
    state: EditorState.create({
        doc: defaultMarkdownParser.parse(this.data),
        plugins: exampleSetup({schema})
      })
    })

  }

}
