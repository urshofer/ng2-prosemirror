import { EventEmitter, OnChanges, SimpleChange } from '@angular/core';
/**
 * Prosemirror component
 * Usage :
 * <prosemirror [(ngModel)]="data" [config]="{...}"></prosemirror>
 */
export declare class ProsemirrorComponent implements OnChanges {
    data: any;
    config: any;
    dataChange: EventEmitter<number>;
    change: EventEmitter<{}>;
    focus: EventEmitter<{}>;
    blur: EventEmitter<{}>;
    host: any;
    instance: any;
    props: any;
    previousValue: any;
    storeTimeout: any;
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
     * Initialize prosemirror
     */
    prosemirrorInit(config: any): void;
}
