 Listen for mouse down events outside of a host component, and mouse leave events
                  for the host component. For touch enabled devices, `touchstart` can be used
                  separately or in conjunction with `mousedown`. You may want to preventDefault() in
                  the `touchstart interactOutsideEvent` handler to prevent emulated `mousedown mouseclick` etc,
                  as this Directive does not call `preventDefault` or `stopPropagation` on any events
 
 - @Input `isListening:boolean` default true. Determines if `Output` events are emitted. This can be toggled
      true and false to update the event emitting at runtime
 - @Input `listenMouseDownOutside` default true. Listen for `mousedown` events outside host
      i.e. `mousedown` event occurred outside the host and hosts child components
 - @Input `listenTouchStartOutside` default false. Listen for `touchstart` events outside host
      i.e. `touchstart` event occurred outside the host and hosts child components
 - @Input `listenMouseLeave` default false. Listen for mouseleave event on host
      i.e. leaves the host component (not triggered while still on child component)
 
 - @Output `interactOutsideEvent: EventEmitter<MouseEvent | TouchEvent>` emits the `mousedown` and/or `touchstart` events
-  @Output `mouseLeaveEvent: EventEmitter<MouseEvent>`

 
  ### Example
 
  ```html
  <div bcInteractOutside
                [isListening]="isMenuOpen"
                [listenMouseDownOutside]="true"
                [listenTouchStartOutside]="true"
                [listenMouseLeave]="true"
                (mouseLeaveEvent)="handleMouseLeave()"
                (interactOutsideEvent)="handleMouseDownOutside($event)">
 
  ```
 
  - `interactOutsideEvent` is based on `host<HTMLElement>.contains(event<MouseEvent>.target)`
  - Event triggered if the host element does not contain the target of the event
  - In the example below, `mousedown` or `touchstart` on `document, x, y, z` would all trigger `interactOutsideEvent`
  - `mouseLeaveEvent` triggers only when the mouse leaves the `host` element. As long as the mouse is over one
      of the `host` child components, mouse leave will not fire. It will also not fire when moving between a
      hosts child components. e.g. in example below, moving from `A->Host` would not trigger the event
 
  ```
 
                +----------+
                | document |
                +----+-----+
                     |
       +--------------------------+
       |             |            |
    +--+---+     +---+---+    +---+---+
    |  x   |     |   y   |    |   z   |
    +--+---+     +-------+    +-------+
       |
    +--+---+
    | Host |
    +--+---+
       |
    +--+---+
    |  A   |
    +--+---+
 
  ```
