"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
var core_1 = require("@angular/core");
var prosemirror_view_1 = require("prosemirror-view");
var prosemirror_state_1 = require("prosemirror-state");
var prosemirror_example_setup_1 = require("prosemirror-example-setup");
var prosemirror_keymap_1 = require("prosemirror-keymap");
var prosemirror_markdown_1 = require("prosemirror-markdown");
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
     * Highlight Elements in Editor
     */
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
            var r = null;
            if (self.higlightRegex !== undefined && self.higlightRegex != "") {
                r = new RegExp(self.higlightRegex, "ig");
            }
            doc.descendants(function (node, pos) {
                if (node.isText) {
                    var m = void 0;
                    if (r !== null) {
                        while (m = r.exec(node.text)) {
                            record(pos + m.index, pos + m.index + m[0].length, 'problem', true);
                        }
                    }
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
        this.plugins = this.plugins.concat(prosemirror_example_setup_1.exampleSetup({ schema: prosemirror_markdown_1.schema }));
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
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "data", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "searchString", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "config", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ProsemirrorComponent.prototype, "dataChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "change", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "focus", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "blur", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "search", void 0);
    __decorate([
        core_1.ViewChild('host'),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "host", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ProsemirrorComponent.prototype, "instance", void 0);
    ProsemirrorComponent = __decorate([
        core_1.Component({
            selector: 'prosemirror',
            template: "<div #host></div>"
        }),
        __metadata("design:paramtypes", [])
    ], ProsemirrorComponent);
    return ProsemirrorComponent;
}());
exports.ProsemirrorComponent = ProsemirrorComponent;
//# sourceMappingURL=prosemirror.component.js.map