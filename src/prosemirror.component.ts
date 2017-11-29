// Imports
import {
  Component,
  Input,
  Output,
  ElementRef,
  ViewChild,
  EventEmitter,
  OnChanges,
  SimpleChange
}                            from '@angular/core';
import {EditorView}          from "prosemirror-view"
import {EditorState}         from "prosemirror-state"
import {exampleSetup}        from "prosemirror-example-setup"
import {
  schema,
  defaultMarkdownParser,
  defaultMarkdownSerializer
}                            from  "prosemirror-markdown"



/**
 * Prosemirror component
 * Usage :
 * <prosemirror [(ngModel)]="data" [config]="{...}"></prosemirror>
 */
@Component({
  selector: 'prosemirror',
  template: `<div #host></div>`
})
export class ProsemirrorComponent implements OnChanges {

  @Input() data: any;
  @Input() config;

  @Output() dataChange: EventEmitter<number>;
  @Output() change = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();

  @ViewChild('host') host;

  @Output() instance = null;

  props: any = null;
  previousValue: any = null;
  storeTimeout: any = null;

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
//      console.log(" ------------------> update", changes);

//      if (changes.data.currentValue !== this.previousValue) {
//        console.log(" ------------------> done");
        this.setContent(changes.data.currentValue);
//      }
  }

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

  setContent(val) {
    if (this.instance !== null && val !== this.previousValue) {
      this.data = val;
      this.props.state.doc = defaultMarkdownParser.parse(this.data);
      this.instance.update(this.props);
    }

  }

  /**
   * Content to Markdown Serializer
   */

  getContent = (tr) => {
    if (this.storeTimeout !== null) {
      clearTimeout(this.storeTimeout);
    }
    this.storeTimeout = setTimeout(() => {
      this.data =  defaultMarkdownSerializer.serialize(this.instance.state.doc);
      if (this.previousValue != this.data) {
        this.previousValue = this.data;
        this.dataChange.emit(this.data);
        this.blur.emit(this.data);
      }
    }, 1000);
    this.change.emit(this.data);
  }

  /**
   * Initialize prosemirror
   */
  prosemirrorInit(config){
    this.previousValue = this.data;
    this.props = {
      state: EditorState.create({
        doc: defaultMarkdownParser.parse(this.data),
        plugins: exampleSetup({schema})
      }),
      handleKeyDown: this.getContent.bind(this)
    };

    this.instance = new EditorView(
      this.host.nativeElement,
      this.props
    );
  }

}
