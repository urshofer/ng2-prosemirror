import { EventEmitter, OnChanges, SimpleChange } from '@angular/core';
/**
 * Prosemirror component
 * Usage :
 * <prosemirror [(ngModel)]="data" [config]="{...}"></prosemirror>
 */
export declare class ProsemirrorComponent implements OnChanges {
    data: any;
    searchString: any;
    config: any;
    dataChange: EventEmitter<number>;
    change: EventEmitter<{}>;
    focus: EventEmitter<{}>;
    blur: EventEmitter<{}>;
    search: EventEmitter<{}>;
    host: any;
    instance: any;
    props: any;
    previousValue: any;
    storeTimeout: any;
    higlightRegex: any;
    plugins: any;
    ngOnChanges(changes: {
        [propKey: string]: SimpleChange;
    }): void;
    /**
     * Constructor
     */
    constructor();
    /**
     * On component destroy
     */
    ngOnDestroy(): void;
    /**
     * On component view init
     */
    ngAfterViewInit(): void;
    setContent(val: any): void;
    /**
     * Content to Markdown Serializer
     */
    getContent: () => void;
    dispatchTransaction: (tr: any) => void;
    /**
     * Find Function, mapped to Mod-f
     * EditorState, EditorView is passed
     */
    findFunc(state: any, instance: any): void;
    /**
     * Insert Elements in Editor
     */
    insertAttachement(object: any): void;
    /**
     * Insert Custom Node in Editor
     * @param config
     */
    insertCustomNode(text: any, node?: any): void;
    /**
     * Insert Custom Node in Editor
     * @param config
     */
    insertCustomTag(type: any): boolean;
    /**
     * Initialize prosemirror
     */
    prosemirrorInit(config: any): void;
}
