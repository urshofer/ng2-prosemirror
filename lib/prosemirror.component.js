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
var prosemirror_setup_1 = require("prosemirror-setup");
var prosemirror_markdown_1 = require("prosemirror-markdown");
/**
 * Prosemirror component
 * Usage :
 * <prosemirror [(ngModel)]="data" [config]="{...}"></prosemirror>
 */
var ProsemirrorComponent = (function () {
    /**
     * Constructor
     */
    function ProsemirrorComponent() {
        var _this = this;
        this.change = new core_1.EventEmitter();
        this.focus = new core_1.EventEmitter();
        this.blur = new core_1.EventEmitter();
        this.instance = null;
        this.props = null;
        this.storeTimeout = null;
        /**
         * Content to Markdown Serializer
         */
        this.getContent = function (tr) {
            if (_this.storeTimeout !== null) {
                clearTimeout(_this.storeTimeout);
            }
            _this.storeTimeout = setTimeout(function () {
                console.log('done');
                _this.data = prosemirror_markdown_1.defaultMarkdownSerializer.serialize(_this.instance.state.doc);
                _this.dataChange.emit(_this.data);
                _this.blur.emit(_this.data);
            }, 250);
            _this.change.emit(_this.data);
        };
        //this.count = 0;
        this.dataChange = new core_1.EventEmitter();
        console.log("*********************\nC O N S T R U C T O R\n*********************");
    }
    ProsemirrorComponent.prototype.ngOnChanges = function (changes) {
        if (changes.data.currentValue !== this.data) {
            console.log(" ------------------> update", changes);
            this.setContent(changes.data.currentValue);
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
        this.data = val;
        if (this.instance !== null) {
            this.props.state.doc = prosemirror_markdown_1.defaultMarkdownParser.parse(this.data);
            this.instance.update(this.props);
        }
    };
    /**
     * Initialize prosemirror
     */
    ProsemirrorComponent.prototype.prosemirrorInit = function (config) {
        console.log("PROSE INIT", this.instance);
        this.props = {
            state: prosemirror_state_1.EditorState.create({
                doc: prosemirror_markdown_1.defaultMarkdownParser.parse(this.data),
                plugins: prosemirror_setup_1.exampleSetup({ schema: prosemirror_markdown_1.schema })
            }),
            handleKeyDown: this.getContent.bind(this)
        };
        this.instance = new prosemirror_view_1.EditorView(this.host.nativeElement, this.props);
    };
    return ProsemirrorComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ProsemirrorComponent.prototype, "data", void 0);
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
exports.ProsemirrorComponent = ProsemirrorComponent;
//# sourceMappingURL=prosemirror.component.js.map