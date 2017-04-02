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
import {exampleSetup}        from "prosemirror-setup"
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

  storeTimeout: any = null;

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
      if (changes.data.currentValue !== this.data) {
        console.log(" ------------------> update", changes);
        this.setContent(changes.data.currentValue);
      }
  }

  /**
   * Constructor
   */
  constructor(){
    //this.count = 0;
    this.dataChange = new EventEmitter<number>();
    console.log("*********************\nC O N S T R U C T O R\n*********************")
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
    this.data = val;
    if (this.instance !== null) {
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
      console.log('done')
      this.data =  defaultMarkdownSerializer.serialize(this.instance.state.doc);
      this.dataChange.emit(this.data);
      this.blur.emit(this.data);
    }, 250);
    this.change.emit(this.data);
  }

  /**
   * Initialize prosemirror
   */
  prosemirrorInit(config){
    console.log("PROSE INIT", this.instance)
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
