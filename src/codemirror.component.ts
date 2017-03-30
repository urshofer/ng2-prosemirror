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
import { NG_VALUE_ACCESSOR } from '@angular/forms';



import {Schema, DOMParser}   from "prosemirror-model"
import {EditorView}          from "prosemirror-view"
import {EditorState}         from "prosemirror-state"
import {schema}              from "prosemirror-schema-basic"
import {addListNodes}        from "prosemirror-schema-list"
import {addTableNodes}       from "prosemirror-schema-table"
import {exampleSetup}        from "prosemirror-example-setup"

/**
 * CodeMirror component
 * Usage :
 * <prosemirror [(ngModel)]="data" [config]="{...}"></prosemirror>
 */
@Component({
  selector: 'prosemirror',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodemirrorComponent),
      multi: true
    }
  ],
  template: `<textarea #host></textarea>`,
})
export class CodemirrorComponent {

  @Input() config;
  @Output() change = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();

  @ViewChild('host') host;

  @Output() instance = null;

  _value = '';

  /**
   * Constructor
   */
  constructor(){}

  get value() { return this._value; };

  @Input() set value(v) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
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
    this.codemirrorInit(this.config);
  }

  /**
   * Initialize codemirror
   */
  codemirrorInit(config){
    const demoSchema = new Schema({
      nodes: addListNodes(addTableNodes(schema.spec.nodes, "block+", "block"), "paragraph block*", "block"),
      marks: schema.spec.marks
    })

    let state = EditorState.create({doc: DOMParser.fromSchema(demoSchema).parse(document.querySelector("#content")),
                                    plugins: exampleSetup({schema: demoSchema})})

    this.instance = new EditorView(this.host.nativeElement, {state})




    this.instance.setValue(this._value);

    this.instance.on('change', () => {
      this.updateValue(this.instance.getValue());
    });

    this.instance.on('focus', () => {
      this.focus.emit();
    });

    this.instance.on('blur', () => {
      this.blur.emit();
    });
  }

  /**
   * Value update process
   */
  updateValue(value){
    this.value = value;
    this.onTouched();
    this.change.emit(value);
  }

  /**
   * Implements ControlValueAccessor
   */
  writeValue(value){
    this._value = value || '';
    if (this.instance) {
      this.instance.setValue(this._value);
    }
  }
  onChange(_){}
  onTouched(){}
  registerOnChange(fn){this.onChange = fn;}
  registerOnTouched(fn){this.onTouched = fn;}
}
