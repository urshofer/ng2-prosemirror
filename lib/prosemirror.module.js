"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var prosemirror_component_1 = require("./prosemirror.component");
/**
 * CodemirrorModule
 */
var ProsemirrorModule = /** @class */ (function () {
    function ProsemirrorModule() {
    }
    ProsemirrorModule.decorators = [
        { type: core_1.NgModule, args: [{
                    declarations: [
                        prosemirror_component_1.ProsemirrorComponent,
                    ],
                    exports: [
                        prosemirror_component_1.ProsemirrorComponent,
                    ]
                },] },
    ];
    return ProsemirrorModule;
}());
exports.ProsemirrorModule = ProsemirrorModule;
//# sourceMappingURL=prosemirror.module.js.map