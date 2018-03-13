# @bcodes/ngx-interact-outside

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

 
  ## Example
 
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

# Development and Contribution

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## .angular-cli.json

The `apps` array includes a second app called `lib`. This is a copy of `apps[0]` json, and allows us to use the *Angular CLI* when generating components/modules etc

```
ng generate module new-mod --flat=true --app=lib
```

The above command would generate a `new-mod.module.ts` file in `lib/app` folder

## lib Folder

The `lib/app` folder contains all of the files for our library

All of these files (module and files) are exported from the `public_api.ts` file. Only non-external imports reachable from this file are included in the library build. All other imports need to be listed as *peerDependencies* in the `lib/package.json` file

## Main Application - Development Mode

While developing the library (within the `lib/app` folder), we can reference and import the files/module directly in `app.module.ts`. This means that changes being made to the library will *live reload* the demo app. This demo app can also be built and added to the repo using GitHub Pages 

```bash
npm i -g angular-cli-ghpages

ng build --prod --base-href "https://<user-name>.github.io/<repo-name>/"
ngh --dir "dist/app" --message "Deploy Demo App"
```

## Build the Library

Run either of the following commands with `npm run`

```json
"build:lib": "rimraf dist && ng-packagr -p lib/package.json",
"test:lib": "npm run build:lib && ng test"
```

### Testing

The tests are contained in the `lib/test` folder. The files to be tested are imported from the `dist/lib` folder, so we are testing the bundled library

```typescript
import { LibaryModule } from '../../dist/lib';
```

The test files are located outside of the root `src` folder and required the following changes to the test setup:

`tsconfig.spec.json`
```json
"include": [
    "../lib/**/*.spec.ts",
    "**/*.spec.ts",
    "**/*.d.ts"
  ]
```
`tests.ts`
```javascript 
const context_lib = require.context('../lib', true, /\.spec\.ts$/);
context_lib.keys().map(context_lib);
```

Run the tests with `ng test`, or `npm run test:lib` to do a build and test

## Continuous Integration Testing

A `.travis.yml` config file controls the CI when commits are made. This builds the library, and runs the tests against the bundled library

## License

This project is licensed under the terms of the MIT license
