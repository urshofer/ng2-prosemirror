import {Component, Input, Output, ViewChild,
        EventEmitter, OnChanges, SimpleChange}    from '@angular/core';
import {EditorView, Decoration, DecorationSet}    from "prosemirror-view"
import {Plugin, EditorState}                      from "prosemirror-state"
import {exampleSetup}                             from "prosemirror-example-setup"
import {keymap}                                   from "prosemirror-keymap"
import {schema, defaultMarkdownParser, 
        defaultMarkdownSerializer}                from "prosemirror-markdown"
import {buildMenuItems}                           from "prosemirror-example-setup"


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
  @Input() searchString: any;  
  @Input() config;

  @Output() dataChange: EventEmitter<number>;
  @Output() change = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();
  @Output() search = new EventEmitter();

  @ViewChild('host') host;

  @Output() instance = null;

  props: any = null;
  previousValue: any = null;
  storeTimeout: any = null;
  higlightRegex : any = null;
  plugins: any = [];

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    try  {
      if (changes['data']) {
        this.setContent(changes['data'].currentValue);
      }
      if (changes['searchString']) {
        this.higlightRegex =  changes['searchString'].currentValue;
        this.props.state = EditorState.create({
          doc: defaultMarkdownParser.parse(this.data),
          plugins: this.plugins
        })
        try {
          this.instance.update(this.props);
        } catch (err) {
          console.log(err.message);
        }

        
      }      
    } catch (err) {
      console.log(err.message);
    }
    
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
      this.previousValue = val;
      this.props.state = EditorState.create({
          doc: defaultMarkdownParser.parse(this.data),
          plugins: this.plugins
       })
      /*this.props.state.doc = defaultMarkdownParser.parse(this.data);*/
      try {
        this.instance.update(this.props);
      } catch (err) {
        console.log(`Message: ${err.message}`);
      }
    }

  }

  /**
   * Content to Markdown Serializer
   */

  getContent = () => {
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

  dispatchTransaction = (tr: any) => {
    if (this.instance.inDOMChange) {
      this.instance.inDOMChange.finish(true);
    }
    try {
      this.instance.updateState(this.props.state = this.props.state.apply(tr))      
      if (tr.steps.length > 0) {
        this.getContent();
      }
    } catch (err) {
      console.log("Error happended", err)
    }
  };


  /** 
   * Find Function, mapped to Mod-f
   * EditorState, EditorView is passed
   */

  findFunc(state, instance) {
    this.search.emit({state, instance});
  }

  /** 
   * Insert Elements in Editor
   */

  insertAttachement(object) {
    console.log(this.props, this.instance, object, schema)
    try {
      if (object.isImage === true) {
        this.instance.dispatch(this.instance.state.tr.replaceSelectionWith(schema.nodes.image.createAndFill(
          {
            src: object.original === true ? object.element.Original : object.element.Resized[0],
            title: object.element.Captions[0],
            alt: object.element.Captions[1]
          }
        )))
        this.instance.focus();
      }
      else {
        this.insertCustomNode(`{{${object.fieldName}:${object.anchorIndex}}}`);
      }  
    } catch (error) {
      console.warn(error)
    }
    
  }
 
  /**
   * Insert Custom Node in Editor
   * @param config 
   */
  insertCustomNode(text, node?: any) {
    node = node || schema.nodes.paragraph
    const textNode = schema.text(text)
    this.instance.dispatch(this.instance.state.tr.replaceSelectionWith(node.create(null, textNode)))
    this.instance.focus();
  }

  /**
   * Insert Custom Node in Editor
   * @param config 
   */
  insertCustomTag(type) {
    let {$from} = this.instance.state.selection
    console.log(type, $from)
    this.instance.dispatch(this.instance.state.tr.replaceSelectionWith(type.create(null,  schema.text(type.name))))
    this.instance.focus();
    //alert('added');
    return true
  }

  
  /**
   * Initialize prosemirror
   */
  prosemirrorInit(config){
    this.previousValue = this.data;
    let self = this;

    let lint = function(doc) {
      let result = []
      function record(from, to, css, inline) {
        result.push({from, to, css, inline})
      }
      // Highlight
      let r = null;
      if (self.higlightRegex !== undefined && self.higlightRegex != "") {
        r = new RegExp(self.higlightRegex, "ig");
      }
      // Soft Hyphen
      let shy  = new RegExp('\u00AD', "g");
      // Attachement
      let att  = new RegExp('\{\{.*?\}\}', "g");
      // Latex Force Break
      let forcebreak  = new RegExp('\\\\\\\\', "g");
      // Indizes
      let marks  = [
        new RegExp('\\[fn:.*?\\]', "g"),
        new RegExp('\\[in:.*?\\]', "g"),
        new RegExp('\\[mark:.*?\\]', "g"),
        new RegExp('\\[reference:.*?\\]', "g")
      ];
      

      doc.descendants((node, pos) => {
        if (node.isText) {
          let m;
          // Find Match
          if (r !== null) {
            while (m = r.exec(node.text)) {
              record(pos + m.index, pos + m.index + m[0].length, 'problem', true)
            }
          }
          while (m = shy.exec(node.text)) {
            record(pos + m.index, pos + m.index + m[0].length, 'soft_hyphen', false)
          }
          while (m = forcebreak.exec(node.text)) {
            record(pos + m.index, pos + m.index + m[0].length, 'force_break', false)
          }          
          while (m = att.exec(node.text)) {
            record(pos + m.index, pos + m.index + m[0].length, 'attachement', true)
          }
          
          let _c = 0;
          marks.forEach(mark => {
            let _m;
            while (_m = mark.exec(node.text)) {
              record(pos + _m.index, pos + _m.index + _m[0].length, `mark mark_${_c}`, true)
            }            
            _c++;
          })

          // Soft Hyphen
          /*let shy;
          while (shy = /\u00AD/g.exec(node.text)) {
            alert(shy);
            record(pos + shy.index, pos + shy.index + shy[0].length, 'soft_hyphen', false)
          }*/
        }
        if (node.type.name === 'hard_break') {
          record(pos, pos, 'hard_break', false)
        }
      })  
    
      return result
    }

    let lintDeco = function(doc) {
      let decos = []
      lint(doc).forEach(prob => {
        if (prob.inline === true) {
          decos.push(Decoration.inline(prob.from, prob.to, {class: prob.css}));  
        }
        else {
          decos.push(Decoration.widget(prob.from, lintIcon(prob)))          
        }
        
      })
      return DecorationSet.create(doc, decos)
    }

    function lintIcon(prob) {
      let icon = document.createElement("span")
      icon.className = prob.css
      return icon
    }

    let lintPlugin = new Plugin({
      state: {
        init(_, {doc}) { return lintDeco(doc) },
        apply(tr, old) { return tr.docChanged ? lintDeco(tr.doc) : old }
      },
      props: {
        decorations(state) { return this.getState(state) }
      }
    })

    this.plugins.push(keymap({
      "Mod-f": () => this.findFunc(this.props, this.instance)
    }));

    this.plugins.push(lintPlugin);

    // Ask example-setup to build its basic menu
    let menu = buildMenuItems(schema)

    this.plugins = this.plugins.concat(exampleSetup({schema: schema, menuContent: menu.fullMenu}));

    try {
      this.props = {
        state: EditorState.create({
          doc: defaultMarkdownParser.parse(this.data),
          plugins: this.plugins
        }),
        dispatchTransaction: this.dispatchTransaction.bind(this)
      };      
    } catch (err) {
      console.log(err, this.data);
      return;
    }
    this.instance = new EditorView(
      this.host.nativeElement,
      this.props
    );
  }

}
