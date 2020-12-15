"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var prosemirror_view_1 = require("prosemirror-view");
var prosemirror_state_1 = require("prosemirror-state");
var prosemirror_example_setup_1 = require("prosemirror-example-setup");
var prosemirror_keymap_1 = require("prosemirror-keymap");
var prosemirror_markdown_1 = require("prosemirror-markdown");
var prosemirror_menu_1 = require("prosemirror-menu");
var prosemirror_example_setup_2 = require("prosemirror-example-setup");
var prosemirror_commands_1 = require("prosemirror-commands");
/**
 * Prosemirror component
 * Usage :
 * <prosemirror [(ngModel)]="data" [config]="{...}"></prosemirror>
 */
var ProsemirrorComponent = /** @class */ (function () {
    /**
     * Constructor
     */
    function ProsemirrorComponent() {
        var _this = this;
        this.change = new core_1.EventEmitter();
        this.focus = new core_1.EventEmitter();
        this.blur = new core_1.EventEmitter();
        this.search = new core_1.EventEmitter();
        this.instance = null;
        this.props = null;
        this.previousValue = null;
        this.storeTimeout = null;
        this.higlightRegex = null;
        this.plugins = [];
        /**
         * Content to Markdown Serializer
         */
        this.getContent = function () {
            if (_this.storeTimeout !== null) {
                clearTimeout(_this.storeTimeout);
            }
            _this.storeTimeout = setTimeout(function () {
                _this.data = prosemirror_markdown_1.defaultMarkdownSerializer.serialize(_this.instance.state.doc);
                if (_this.previousValue != _this.data) {
                    _this.previousValue = _this.data;
                    _this.dataChange.emit(_this.data);
                    _this.blur.emit(_this.data);
                }
            }, 1000);
            _this.change.emit(_this.data);
        };
        this.dispatchTransaction = function (tr) {
            if (_this.instance.inDOMChange) {
                _this.instance.inDOMChange.finish(true);
            }
            try {
                _this.instance.updateState(_this.props.state = _this.props.state.apply(tr));
                if (tr.steps.length > 0) {
                    _this.getContent();
                }
            }
            catch (err) {
                console.log("Error happended", err);
            }
        };
        //this.count = 0;
        this.dataChange = new core_1.EventEmitter();
    }
    ProsemirrorComponent.prototype.ngOnChanges = function (changes) {
        try {
            if (changes['data']) {
                this.setContent(changes['data'].currentValue);
            }
            if (changes['searchString']) {
                this.higlightRegex = changes['searchString'].currentValue;
                this.props.state = prosemirror_state_1.EditorState.create({
                    doc: prosemirror_markdown_1.defaultMarkdownParser.parse(this.data),
                    plugins: this.plugins
                });
                try {
                    this.instance.update(this.props);
                }
                catch (err) {
                    console.log(err.message);
                }
            }
        }
        catch (err) {
            console.log(err.message);
        }
    };
    /**
     * On component destroy
     */
    ProsemirrorComponent.prototype.ngOnDestroy = function () {
    };
    /**
     * On component view init
     */
    ProsemirrorComponent.prototype.ngAfterViewInit = function () {
        this.config = this.config || {};
        this.prosemirrorInit(this.config);
    };
    ProsemirrorComponent.prototype.setContent = function (val) {
        if (this.instance !== null && val !== this.previousValue) {
            this.data = val;
            this.props.state = prosemirror_state_1.EditorState.create({
                doc: prosemirror_markdown_1.defaultMarkdownParser.parse(this.data),
                plugins: this.plugins
            });
            /*this.props.state.doc = defaultMarkdownParser.parse(this.data);*/
            try {
                this.instance.update(this.props);
            }
            catch (err) {
                console.log("Message: " + err.message);
            }
        }
    };
    /**
     * Find Function, mapped to Mod-f
     * EditorState, EditorView is passed
     */
    ProsemirrorComponent.prototype.findFunc = function (state, instance) {
        this.search.emit({ state: state, instance: instance });
    };
    /**
     * Insert Elements in Editor
     */
    ProsemirrorComponent.prototype.insertAttachement = function (object) {
        console.log(this.props, this.instance, object, prosemirror_markdown_1.schema);
        try {
            if (object.isImage === true) {
                this.instance.dispatch(this.instance.state.tr.replaceSelectionWith(prosemirror_markdown_1.schema.nodes.image.createAndFill({
                    src: object.original === true ? object.element.Original : object.element.Resized[0],
                    title: object.element.Captions[0],
                    alt: object.element.Captions[0]
                })));
                this.instance.focus();
            }
            else {
                this.insertCustomNode("{{" + object.fieldName + ":" + object.anchorIndex + "}}");
            }
        }
        catch (error) {
            console.warn(error);
        }
    };
    /**
     * Insert Custom Node in Editor
     * @param config
     */
    ProsemirrorComponent.prototype.insertCustomNode = function (text) {
        var textNode = prosemirror_markdown_1.schema.text(text);
        this.instance.dispatch(this.instance.state.tr.replaceSelectionWith(prosemirror_markdown_1.schema.nodes.paragraph.create(null, textNode)));
        this.instance.focus();
    };
    /**
     * Insert Custom Node in Editor
     * @param config
     */
    ProsemirrorComponent.prototype.insertCustomTag = function (type) {
        var $from = this.instance.state.selection.$from;
        console.log(type, $from);
        //this.instance.dispatch(this.instance.state.tr.replaceSelectionWith(type.create(null,  schema.text('some text'))))
        prosemirror_commands_1.wrapIn(type.nodeType, type.attrs)(this.instance.state, this.instance.dispatch);
        this.instance.focus();
        //alert('added');
        return true;
    };
    /**
     * Initialize prosemirror
     */
    ProsemirrorComponent.prototype.prosemirrorInit = function (config) {
        var _this = this;
        this.previousValue = this.data;
        var self = this;
        var lint = function (doc) {
            var result = [];
            function record(from, to, css, inline) {
                result.push({ from: from, to: to, css: css, inline: inline });
            }
            // Highlight
            var r = null;
            if (self.higlightRegex !== undefined && self.higlightRegex != "") {
                r = new RegExp(self.higlightRegex, "ig");
            }
            // Soft Hyphen
            var shy = new RegExp('\u00AD', "g");
            // Attachement
            var att = new RegExp('\{\{.*?\}\}', "g");
            // Indizes
            var marks = [
                new RegExp('\\[fn:.*?\\]', "g"),
                new RegExp('\\[in:.*?\\]', "g"),
                new RegExp('\\[mark:.*?\\]', "g"),
                new RegExp('\\[reference:.*?\\]', "g")
            ];
            doc.descendants(function (node, pos) {
                if (node.isText) {
                    var m = void 0;
                    // Find Match
                    if (r !== null) {
                        while (m = r.exec(node.text)) {
                            record(pos + m.index, pos + m.index + m[0].length, 'problem', true);
                        }
                    }
                    while (m = shy.exec(node.text)) {
                        record(pos + m.index, pos + m.index + m[0].length, 'soft_hyphen', false);
                    }
                    while (m = att.exec(node.text)) {
                        record(pos + m.index, pos + m.index + m[0].length, 'attachement', true);
                    }
                    var _c_1 = 0;
                    marks.forEach(function (mark) {
                        var _m;
                        while (_m = mark.exec(node.text)) {
                            record(pos + _m.index, pos + _m.index + _m[0].length, "mark mark_" + _c_1, true);
                        }
                        _c_1++;
                    });
                    // Soft Hyphen
                    /*let shy;
                    while (shy = /\u00AD/g.exec(node.text)) {
                      alert(shy);
                      record(pos + shy.index, pos + shy.index + shy[0].length, 'soft_hyphen', false)
                    }*/
                }
                if (node.type.name === 'hard_break') {
                    record(pos, pos, 'hard_break', false);
                }
            });
            return result;
        };
        var lintDeco = function (doc) {
            var decos = [];
            lint(doc).forEach(function (prob) {
                if (prob.inline === true) {
                    decos.push(prosemirror_view_1.Decoration.inline(prob.from, prob.to, { class: prob.css }));
                }
                else {
                    decos.push(prosemirror_view_1.Decoration.widget(prob.from, lintIcon(prob)));
                }
            });
            return prosemirror_view_1.DecorationSet.create(doc, decos);
        };
        function lintIcon(prob) {
            var icon = document.createElement("span");
            icon.className = prob.css;
            return icon;
        }
        var lintPlugin = new prosemirror_state_1.Plugin({
            state: {
                init: function (_, _a) {
                    var doc = _a.doc;
                    return lintDeco(doc);
                },
                apply: function (tr, old) { return tr.docChanged ? lintDeco(tr.doc) : old; }
            },
            props: {
                decorations: function (state) { return this.getState(state); }
            }
        });
        this.plugins.push(prosemirror_keymap_1.keymap({
            "Mod-f": function () { return _this.findFunc(_this.props, _this.instance); }
        }));
        this.plugins.push(lintPlugin);
        // Ask example-setup to build its basic menu
        var menu = prosemirror_example_setup_2.buildMenuItems(prosemirror_markdown_1.schema);
        // Add a dino-inserting item for each type of dino
        var mixins = [
            ["Footnote", '[fn:]'],
            ["Index", '[in:]'],
            ["Mark", '[mark:]']
        ];
        mixins.forEach(function (name) { return menu.insertMenu.content.push(new prosemirror_menu_1.MenuItem({
            title: "Insert " + name[0],
            label: name[0],
            run: function () { _this.insertCustomNode(name[1]); }
        })); });
        menu.insertMenu.content.push(new prosemirror_menu_1.MenuItem({
            title: "Custom Tag: Footnote",
            label: "Custom Tag: Footnote",
            run: function () { _this.insertCustomTag(prosemirror_markdown_1.schema.nodes.footnote); }
        }));
        this.plugins = this.plugins.concat(prosemirror_example_setup_1.exampleSetup({ schema: prosemirror_markdown_1.schema, menuContent: menu.fullMenu }));
        try {
            this.props = {
                state: prosemirror_state_1.EditorState.create({
                    doc: prosemirror_markdown_1.defaultMarkdownParser.parse(this.data),
                    plugins: this.plugins
                }),
                dispatchTransaction: this.dispatchTransaction.bind(this)
            };
        }
        catch (err) {
            console.log(err, this.data);
            return;
        }
        this.instance = new prosemirror_view_1.EditorView(this.host.nativeElement, this.props);
    };
    ProsemirrorComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'prosemirror',
                    template: "<div #host></div>"
                },] },
    ];
    /** @nocollapse */
    ProsemirrorComponent.ctorParameters = function () { return []; };
    ProsemirrorComponent.propDecorators = {
        data: [{ type: core_1.Input }],
        searchString: [{ type: core_1.Input }],
        config: [{ type: core_1.Input }],
        dataChange: [{ type: core_1.Output }],
        change: [{ type: core_1.Output }],
        focus: [{ type: core_1.Output }],
        blur: [{ type: core_1.Output }],
        search: [{ type: core_1.Output }],
        host: [{ type: core_1.ViewChild, args: ['host',] }],
        instance: [{ type: core_1.Output }]
    };
    return ProsemirrorComponent;
}());
exports.ProsemirrorComponent = ProsemirrorComponent;
//# sourceMappingURL=prosemirror.component.js.map