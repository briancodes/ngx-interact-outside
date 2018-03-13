import { Directive, Input, Output, OnInit, Renderer2, EventEmitter, ElementRef, OnDestroy } from '@angular/core';

/**
 * @description Listen for mouse down events outside of a host component, and mouse leave events
 *                 for the host component. For touch enabled devices, `touchstart` can be used
 *                 separately or in conjunction with `mousedown`. You may want to preventDefault() in
 *                 the `touchstart interactOutsideEvent` handler to prevent emulated `mousedown mouseclick` etc,
 *                 as this Directive does not call `preventDefault` or `stopPropagation` on any events
 *
 * @Input `isListening:boolean` default true. Determines if `Output` events are emitted. This can be toggled
 *     true and false to update the event emitting at runtime
 * @Input `listenMouseDownOutside` default true. Listen for `mousedown` events outside host
 *     i.e. `mousedown` event occurred outside the host and hosts child components
 * @Input `listenTouchStartOutside` default false. Listen for `touchstart` events outside host
 *     i.e. `touchstart` event occurred outside the host and hosts child components
 * @Input `listenMouseLeave` default false. Listen for mouseleave event on host
 *     i.e. leaves the host component (not triggered while still on child component)
 *
 * @Output `interactOutsideEvent: EventEmitter<MouseEvent | TouchEvent>` emits the `mousedown` and/or `touchstart` events
 * @Output `mouseLeaveEvent: EventEmitter<MouseEvent>`
 *
 * @note some browsers trigger mouseleave when buttons clicked, tooltips show etc. These browser specific
 *     bugs are not addressed here. The mouseleave event is attached to the host, with no bells or whistles.
 * - And the following HTML:
 *
 * ### Example
 *
 * ```html
 * <div bcInteractOutside
 *               [isListening]="isMenuOpen"
 *               [listenMouseDownOutside]="true"
 *               [listenTouchStartOutside]="true"
 *               [listenMouseLeave]="true"
 *               (mouseLeaveEvent)="handleMouseLeave()"
 *               (interactOutsideEvent)="handleMouseDownOutside($event)">
 *
 * ```
 *
 * - `interactOutsideEvent` is based on host:HTMLElement.contains(MouseEvent.target)
 * - Event triggered if the host element does not contain the target of the event
 * - In the example below, `mousedown` or `touchstart` on `document, x, y, z` would all trigger `interactOutsideEvent`
 * - `mouseLeaveEvent` triggers only when the mouse leaves the `host` element. As long as the mouse is over one
 *     of the `host` child components, mouse leave will not fire. It will also not fire when moving between a
 *     hosts child components. e.g. in example below, moving from `A->Host` would not trigger the event
 *
 * ```
 *
 *               +----------+
 *               | document |
 *               +----+-----+
 *                    |
 *      +--------------------------+
 *      |             |            |
 *   +--+---+     +---+---+    +---+---+
 *   |  x   |     |   y   |    |   z   |
 *   +--+---+     +-------+    +-------+
 *      |
 *   +--+---+
 *   | Host |
 *   +--+---+
 *      |
 *   +--+---+
 *   |  A   |
 *   +--+---+
 *
 * ```
 **
*/
@Directive({
    selector: '[bcInteractOutside]'
})
export class InteractOutsideDirective implements OnInit, OnDestroy {

    // @Inputs
    private _isListening = true;
    private _listenMouseDownOutside = true;
    private _listenTouchStartOutside = false;
    private _listenMouseLeave = false;

    // @Outputs
    /** @Output for `mousedown` and/or `touchstart` outside of host component. Both can be enabled/disabled individually */
    @Output() interactOutsideEvent: EventEmitter<MouseEvent | TouchEvent> = new EventEmitter();
    @Output() mouseLeaveEvent: EventEmitter<MouseEvent> = new EventEmitter();

    private htmlElement: HTMLElement;
    private isInitialized = false;

    // Listeners references retained for removal
    private mouseDownListener: Function;
    private touchStartListener: Function;
    private mouseLeaveListener: Function;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        this.htmlElement = elementRef.nativeElement;
    }

    ngOnInit(): void {
        this.isInitialized = true;
        this.updateListeners();
    }

    ngOnDestroy(): void {
        this.clearListeners();
    }

    /** Toggle removal/addition of the event listeners.*/
    @Input()
    set isListening(value: boolean) {
        this._isListening = value;
        if (this.isInitialized) {
            this.updateListeners();
        }
    }

    /** Toggle listen for `mousedown` outside*/
    @Input()
    set listenMouseDownOutside(value: boolean) {
        this._listenMouseDownOutside = value;
        if (this.isInitialized) {
            this.updateListeners();
        }
    }

    /** Toggle listen for `touchstart` outside*/
    @Input()
    set listenTouchStartOutside(value: boolean) {
        this._listenTouchStartOutside = value;
        if (this.isInitialized) {
            this.updateListeners();
        }
    }

    /** Toggle listen for `mouseleave` */
    @Input()
    set listenMouseLeave(value: boolean) {
        this._listenMouseLeave = value;
        if (this.isInitialized) {
            this.updateListeners();
        }
    }

    private updateListeners() {
        // Clear out any current listeners
        this.clearListeners();

        if (this._isListening) {
            if (this._listenMouseDownOutside) {
                // listen() takes a string (window, document) or HTMLElement. If string applies listenGlobal
                this.mouseDownListener = this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
                    this.handleMouseDown(event);
                });
            }
            if (this._listenTouchStartOutside) {
                this.touchStartListener = this.renderer.listen('document', 'touchstart', (event: TouchEvent) => {
                    this.handleTouchStart(event);
                });
            }
            if (this._listenMouseLeave) {
                this.mouseLeaveListener = this.renderer.listen(this.htmlElement, 'mouseleave', (event: MouseEvent) => {
                    this.handleMouseLeave(event);
                });
            }
        }
    }

    private handleMouseDown(event: MouseEvent) {
        if (event && event.target) {
            if (!this.htmlElement.contains(event.target as any)) {
                this.interactOutsideEvent.emit(event);
            }
        }
    }

    /**
     * Handle the touchstart event.
     * Using changedTouches, to get the first contact point.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/changedTouches
     * changedTouches: For the touchstart event, it is a list of the touch points
     * that became active with the current event (touches and targetTouches are not as 'current' event
     * specific)
     *
     * @see https://www.html5rocks.com/en/mobile/touch/#toc-device for info on device support
     *
     * @param event TouchEvent
     */
    private handleTouchStart(event: TouchEvent) {
        if (event && event.changedTouches && event.changedTouches.length) {
            const touch = event.changedTouches[0] as Touch;
            if (touch && touch.target) {
                if (!this.htmlElement.contains(touch.target as any)) {
                    this.interactOutsideEvent.emit(event);
                }
            }
        }
    }

    private handleMouseLeave(event: MouseEvent) {
        // Chrome fast clicking triggering fasle positive mouseleave events
        if (event && (event.relatedTarget || event.toElement)) {
            this.mouseLeaveEvent.emit(event);
        }
    }

    private clearListeners() {
        let cleared;
        // calling the handler removes listener
        cleared = this.mouseDownListener && this.mouseDownListener();
        cleared = this.touchStartListener && this.touchStartListener();
        cleared = this.mouseLeaveListener && this.mouseLeaveListener();

        this.mouseDownListener = null;
        this.touchStartListener = null;
        this.mouseLeaveListener = null;
    }

    /**
     * Get the read-only current state of the directive. Useful in testing, as all values private to prevent
     * updates without listeners being updated
     */
    get currentState(): CurrentState {
        return {
            isListening: this._isListening,
            listenMouseDownOutside: this._listenMouseDownOutside,
            listenTouchStartOutside: this._listenTouchStartOutside,
            listenMouseLeave: this._listenMouseLeave,
            listenersCleared: (!this.mouseDownListener && !this.touchStartListener && !this.mouseLeaveListener)
        };
    }

}

/**
 * Interface for bject with current state of component properties
 */
export interface CurrentState {
    isListening: boolean;
    listenMouseDownOutside: boolean;
    listenTouchStartOutside: boolean;
    listenMouseLeave: boolean;
    listenersCleared: boolean;
}
