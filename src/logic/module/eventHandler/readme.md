# Eventhandler
This abstract class can be used to create other EventHandlers. 

## Implementation
create a new Class based on the EventHandler, for basic usage there is no need for additional Implementation
```ts
class MyEventHandler extends EventHandler {}

```

Register an event callback
```ts
let eventHandler = new MyEventHandler();
eventHandler.subscribe('myEvent',(caller:any, args:any) => {
            console.log([`Event is called by`,caller, 'Args: ', args]);
        })
```
To trigger this Event just call this
```ts
eventHandler.callEvent('myEvent',null,{data:"testdata"});
```