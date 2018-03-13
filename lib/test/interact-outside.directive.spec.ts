import { InteractOutsideDirective, CurrentState } from '../../dist/lib';
import { TestBed, ComponentFixture, fakeAsync, tick, async } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/*
 * These tests cover the events emitted by `mousedown`, `mouseleave`, `touchstart` and the setting and updating of
 * the inputs.
 *
 * NOTE: TouchEvent interface for TypeScript has issues, new Touch instances cannot be created,
 *  nor can the `chagnedTouches` be initialized. Using a UIEvent implementation with the added
 *  TouchEvent properties instead (as is done with Angular Material project)
 *  @see https://github.com/angular/material2/blob/master/src/cdk/testing/event-objects.ts
 */

@Component({
    template: `
    <div id="parentDiv">
        <div id="firstSiblingDiv"></div>
        <div id="targetDiv" bcInteractOutside
                [isListening]="isListening"
                [listenMouseDownOutside]="isListenMouseDownOutside"
                [listenTouchStartOutside]="isListenTouchStartOutside"
                [listenMouseLeave]="isListenMouseLeave"
                (mouseLeaveEvent)="handleMouseLeave($event)"
                (interactOutsideEvent)="handleInteractOutside($event)">

                <div id="firstChildDiv">
                </div>
        </div>
        <div id="lastSiblingDiv"></div>
    </div>
    `
})
class TestInteractOutsideComponent {

    isListening = true;
    isListenMouseDownOutside = true;
    isListenTouchStartOutside = true;
    isListenMouseLeave = true;

    interactOutsideCount = 0;
    mouseLeaveCount = 0;

    handleInteractOutside(event: Event) {
        this.interactOutsideCount += 1;
    }

    handleMouseLeave(event: Event) {
        this.mouseLeaveCount += 1;
    }

}

describe('InteractOutsideDirective', () => {

    let fixture: ComponentFixture<TestInteractOutsideComponent>;
    let component: TestInteractOutsideComponent;

    let targetDebugElement: DebugElement;

    let parent: HTMLElement;
    let target: HTMLElement;
    let child: HTMLElement;
    let firstSibling: HTMLElement;
    let lastSibling: HTMLElement;

    let directiveInstance: InteractOutsideDirective;

    describe('Directive: InteractOutsideDirective', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                declarations: [TestInteractOutsideComponent, InteractOutsideDirective]
            });
            fixture = TestBed.createComponent(TestInteractOutsideComponent);
            component = fixture.componentInstance;

            targetDebugElement = fixture.debugElement.query(By.css('#targetDiv'));
            directiveInstance = targetDebugElement.injector.get(InteractOutsideDirective);

            parent = fixture.debugElement.query(By.css('#parentDiv')).nativeElement;
            target = targetDebugElement.nativeElement;
            child = fixture.debugElement.query(By.css('#firstChildDiv')).nativeElement;
            firstSibling = fixture.debugElement.query(By.css('#firstSiblingDiv')).nativeElement;
            lastSibling = fixture.debugElement.query(By.css('#lastSiblingDiv')).nativeElement;

            // *** NOTE:
            // The Directive will have it's default properties until
            //   fixture.detectChanges(); is called. Do this in the it() functions explicitly
        });
        /**
         * 1. Listening, not listening
         * 2. Mouse down, touch start on each
         * 3. Mouse leave on each
         * 4. All with listening, all with not listening
         * 5. Listeners removed
         */
        it('should have defaults, and update all inputs and listeners during initialization', () => {
            let currentState: CurrentState = directiveInstance.currentState;

            // Check the Directives defaults
            expect(currentState.isListening).toEqual(true);
            expect(currentState.listenMouseDownOutside).toEqual(true);
            expect(currentState.listenTouchStartOutside).toEqual(false); // false by default
            expect(currentState.listenMouseLeave).toEqual(false); // false by default

            // Triggers the directive to initialize inputs, fire ngOnInit()
            fixture.detectChanges();
            currentState = directiveInstance.currentState;

            // TestInteractOutsideComponent has all it's data binding properties set to true
            expect(currentState.isListening).toEqual(true);
            expect(currentState.listenMouseDownOutside).toEqual(true);
            expect(currentState.listenTouchStartOutside).toEqual(true);
            expect(currentState.listenMouseLeave).toEqual(true);
            expect(currentState.listenersCleared).toEqual(false);

        });

        it('it should update it\'s internal @Inputs and setting when Component properties change', () => {

            let currentState: CurrentState;

            // Disable the bound properties on the Component
            // This should update the Directives inputs, and the listeners
            component.isListenMouseDownOutside = false;
            component.isListenTouchStartOutside = false;
            component.isListenMouseLeave = false;

            fixture.detectChanges();
            currentState = directiveInstance.currentState;

            expect(currentState.isListening).toEqual(true); // We didn't disable the overall listening property
            expect(currentState.listenMouseDownOutside).toEqual(false);
            expect(currentState.listenTouchStartOutside).toEqual(false);
            expect(currentState.listenMouseLeave).toEqual(false);
            expect(currentState.listenersCleared).toEqual(true);

            // Reset all to true, but disable isListening
            component.isListenMouseDownOutside = true;
            component.isListenTouchStartOutside = true;
            component.isListenMouseLeave = true;
            component.isListening = false;

            fixture.detectChanges();
            currentState = directiveInstance.currentState;

            expect(currentState.isListening).toEqual(false);
            expect(currentState.listenMouseDownOutside).toEqual(true);
            expect(currentState.listenTouchStartOutside).toEqual(true);
            expect(currentState.listenMouseLeave).toEqual(true);
            expect(currentState.listenersCleared).toEqual(true);
        });

        it('should emit mousedown outside events, ignore mousedown on/inside, events reflect current listeners', () => {

            // Using the Test Components settings
            fixture.detectChanges(); // trigger the onInit() of directive

            const me = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });

            // Dispatch 3 mousedown outside of the target
            parent.dispatchEvent(me);
            firstSibling.dispatchEvent(me);
            lastSibling.dispatchEvent(me);
            expect(component.interactOutsideCount).toEqual(3);

            // Simulate 2 mousedowns on/within the target
            target.dispatchEvent(me);
            child.dispatchEvent(me);
            expect(component.interactOutsideCount).toEqual(3); // Still the same count

            // Disable the mousedown listener, and same again
            component.isListenMouseDownOutside = false;
            fixture.detectChanges();
            parent.dispatchEvent(me);
            expect(component.interactOutsideCount).toEqual(3); // Should be the same

            // Reset the listening boolean
            component.isListenMouseDownOutside = true;
            fixture.detectChanges();
            parent.dispatchEvent(me);
            expect(component.interactOutsideCount).toEqual(4); // Should emit

            // Reset the listening boolean to false
            component.isListening = false;
            fixture.detectChanges();
            parent.dispatchEvent(me);
            expect(component.interactOutsideCount).toEqual(4); // Should be the same

            // Start listening again
            component.isListening = true;
            fixture.detectChanges();
            parent.dispatchEvent(me);
            expect(component.interactOutsideCount).toEqual(5); // Should emit

        });

        // Touch Start Test
        it('should emit touchstart outside events, ignore touchstart on/inside, events reflect current listeners', () => {

            // Listen for touchstart events
            component.isListenTouchStartOutside = true;
            // Using the Test Components settings
            fixture.detectChanges(); // trigger the onInit() of directive

            // Dispatch 3 touchstart events outside of the target
            dispatchTouchEvent(parent, 'touchstart');
            dispatchTouchEvent(firstSibling, 'touchstart');
            dispatchTouchEvent(lastSibling, 'touchstart');

            expect(component.interactOutsideCount).toEqual(3);

            // Simulate 2 touchstart's on/within the target
            dispatchTouchEvent(target, 'touchstart');
            dispatchTouchEvent(child, 'touchstart');

            expect(component.interactOutsideCount).toEqual(3); // Still the same count

            // Disable the touchstart listener, and emit touch outside
            component.isListenTouchStartOutside = false;
            fixture.detectChanges();
            dispatchTouchEvent(parent, 'touchstart');

            expect(component.interactOutsideCount).toEqual(3); // Should be the same

            // Reset the listening boolean to true
            component.isListenTouchStartOutside = true;
            fixture.detectChanges();
            dispatchTouchEvent(parent, 'touchstart');
            expect(component.interactOutsideCount).toEqual(4); // Should emit

            // Reset the listening boolean to false
            component.isListening = false;
            fixture.detectChanges();
            dispatchTouchEvent(parent, 'touchstart');
            expect(component.interactOutsideCount).toEqual(4); // Should be the same

            // Start listening again
            component.isListening = true;
            fixture.detectChanges();
            dispatchTouchEvent(parent, 'touchstart');
            expect(component.interactOutsideCount).toEqual(5); // Should emit

        });

        it('should emit mouseleave events', () => {

            // Using the Test Components settings
            fixture.detectChanges(); // trigger the onInit() of directive

            const ml = new MouseEvent('mouseleave', { bubbles: true, cancelable: true, view: window });

            // Chrome fast clicking between text bug: can trigger mouseLeave with toElement/relatedTarget null
            // Cannot assign read-only directly
            Object.defineProperties(ml, {
                toElement: { value: lastSibling }
            });

            // Dispatch 3 mouseleave on parent an siblings
            parent.dispatchEvent(ml);
            firstSibling.dispatchEvent(ml);
            lastSibling.dispatchEvent(ml);
            expect(component.mouseLeaveCount).toEqual(0);

            // Simulate 2 mouseleave on/within the target
            target.dispatchEvent(ml);
            target.dispatchEvent(ml);
            expect(component.mouseLeaveCount).toEqual(2);

            // Disable the mouseleave listener, and same again
            component.isListenMouseLeave = false;
            fixture.detectChanges();
            target.dispatchEvent(ml);
            expect(component.mouseLeaveCount).toEqual(2); // Should be the same

            // Reset the listening boolean
            component.isListenMouseLeave = true;
            fixture.detectChanges();
            target.dispatchEvent(ml);
            expect(component.mouseLeaveCount).toEqual(3); // Should emit

            // Reset the listening boolean to false
            component.isListening = false;
            fixture.detectChanges();
            target.dispatchEvent(ml);
            expect(component.mouseLeaveCount).toEqual(3); // Should be the same

            // Start listening again
            component.isListening = true;
            fixture.detectChanges();
            target.dispatchEvent(ml);
            expect(component.mouseLeaveCount).toEqual(4); // Should emit

        });

    });
});

/**
 * Creates a browser TouchEvent
 * @see https://github.com/angular/material2/blob/master/src/cdk/testing/event-objects.ts
*/
function dispatchTouchEvent(touchTarget: HTMLElement, type: string): UIEvent {
    // The necessary details for the event will be set manually.
    const event = document.createEvent('UIEvent');

    event.initUIEvent(type, true, true, window, 0);

    // Simulate a touch being made on the element.
    const touches = [{ target: touchTarget }];

    // chagangedTouches has targets specific to this event only, unlike `touches` and `targetTouches`,
    // @see MDN definitions for TouchEvent properties
    Object.defineProperties(event, {
        changedTouches: { value: touches }
    });
    touchTarget.dispatchEvent(event);
    return event;
}




