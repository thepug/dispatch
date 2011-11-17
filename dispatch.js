/*
 * Simple, lightweight event processing class. 
 */
 
/*global $, jQuery, window, document, console, Collecta,
          unescape, setTimeout */

var Dispatch = {
    LOG_ALL_EVENTS: false,
    LOG_ALL_NON_TIME_EVENTS: false,
    
    chains: {},
    /* Dictionary: prioritymap
     * Used to map priority labels to actual priority numbers.  The
     * format is Dispatch.prioritymap["label"] = 100;
     *
     * Defaults are low, med, and high.
     */
    prioritymap: {'low':100,'med':50,'high':1}, 

    /* Function: publish
     * Publish an event and execute the handlers for the event.
     * 
     * Parameters:
     *    (String) event - The event name.
     *    (Object) data - The data parameters for event each handler.
     */
    publish: function (event, data) {
        var chain = Dispatch._find_chain(event);
        for(var i = 0; i < chain.length; i++)
        {
            try {
                chain[i].handler(data);
                if (chain[i].run_once) {
                    chain.splice(i, 1);
                }
            } catch(error) {
                console.error(error);
          }
        }
    },
    
    /* Function: publish_async
     * Publish an event and execute the handlers for the event asyncronously.
     * 
     * Parameters:
     *    (String) event - The event name.
     *    (Object) data - The data parameters for event each handler.
     */
    publish_async: function(event, data) {
        setTimeout( function() {
            Dispatch.publish(event, data);
        }, 0);
    },

    /* Function: subscribe 
     * Subscribe a handler to an event. Handlers
     * are sorted by priority in descending order.
     * 
     *
     * Parameters: 
     *     (String) event - The name of the event.  
     *     (Function) fn - The handler to be excecuted for the given event.
     *     (Integer) priority - Optional paramter to set the priority. The
     *                          default is 50.
    */
    subscribe: function (event, fn, priority, run_once) {
        var chain = Dispatch._find_chain(event);
        var once = false; // default
        var prio = 50; //default priority
        //if priority specified use it
        if(priority)
        {
            prio = priority;
            //search priority map
            if(Dispatch.prioritymap[priority]) 
            {
                prio = Dispatch.prioritymap[priority];
            }
        }
        if (run_once)
        {
            once = run_once;
        }
        var handler = {handler:fn,priority:prio,run_once:once};
        chain.push(handler);
    
        //sort chain
        chain.sort(function(a,b) {return a.priority - b.priority;});
        return fn;
    },
    
    /* Function: once 
     * Subscribe a handler to an event one time only
     * exactly the same as Subscribe, but is removed
     * from the queue once fired
    */
    once: function (event, fn, priority) {
        Dispatch.subscribe(event, fn, priority, true);
    },
    /* Private Function: _find_chain
     *  look up the handler queue for the event.
     */
    _find_chain: function (event) {
        var chain = Dispatch.chains[event];
        if (!chain) 
        {
            chain = Dispatch.chains[event] = [];
        }
        return chain;
    }
};
