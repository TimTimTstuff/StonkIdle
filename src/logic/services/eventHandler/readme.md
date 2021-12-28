# Global Event Service
This GlobalEvent is registered as Service, that means all Events and Registrations stay forever. 

Excample of the createScene Event. 
Steup in the LoaderScene, subscribe to the event 'createScene' and just console log which scene was loaded. 

```ts
GameServices.getService<GlobalEvents>(GlobalEvents.name).subscribe('createScene',(caller:Scene, args:any) => {
            console.log(`New Scene Loaded: ${caller.scene.settings.key}`);
            console.log(['Args?', args]);
        })

``` 

In every Scene there is this line, which fires the Event
(this refereres to the current scene)
```ts
GameServices.getService<GlobalEvents>(GlobalEvents.name).callEvent('createScene',this,{data:"testdata"});
```