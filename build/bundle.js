
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const getMax = function (arr) {
      let max = arr[0];
      for (let i = 1; i < arr.length; ++i) {
        if (arr[i] > max) {
          max = arr[i];
        }
      }
      return max
    };

    const linear = function (obj) {
      let world = obj.world || [];
      let minmax = obj.minmax || obj.minMax || [];
      const calc = (num) => {
        let range = minmax[1] - minmax[0];
        let percent = (num - minmax[0]) / range;
        let size = world[1] - world[0];
        return size * percent
      };

      return calc
    };

    const layoutByStack = function (arr, max) {
      let byStack = {};
      arr.forEach((a) => {
        byStack[a.stack] = byStack[a.stack] || [];
        byStack[a.stack].push(a);
      });
      // console.log(byStack)
      byStack = Object.keys(byStack).map((k) => byStack[k]);
    };

    const layout = function (arr, max) {
      // compuate a stacked layout
      if (arr && arr[0] && arr[0].stack) {
        return layoutByStack(arr)
      }
      max = max || getMax(arr.map((a) => a.value));
      let scale = linear({
        world: [0, 100],
        minmax: [0, max]
      });
      let percent = 1 / arr.length;
      arr.forEach((o) => {
        o.size = scale(o.value);
        o.share = percent * 100;
        o.already = 0;
      });
      // convert to stacked format
      arr = arr.map((o) => [o]);
      return arr
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/Horizontal.svelte generated by Svelte v3.24.1 */
    const file = "src/Horizontal.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-1bbyntm-style";
    	style.textContent = ".barchart.svelte-1bbyntm{position:relative;width:100%;display:flex;flex-direction:row;justify-content:space-around;align-items:flex-start;text-align:right;flex-wrap:nowrap;align-self:stretch}.col.svelte-1bbyntm{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;text-align:center;flex-wrap:wrap;align-self:stretch}.bars.svelte-1bbyntm{flex:1}.labels.svelte-1bbyntm{position:relative;flex:0;align-items:flex-end;text-align:right}.row.svelte-1bbyntm{height:20px;margin-top:5px;margin-bottom:5px}.label.svelte-1bbyntm{position:relative;top:-1px;align-self:flex-end;color:#a6a4a4;font-size:16px;margin-right:5px;margin-left:1rem;margin-right:1rem;white-space:nowrap}.bar.svelte-1bbyntm{position:relative;border-radius:2px;box-shadow:2px 2px 8px 0px rgba(0, 0, 0, 0.2)}.bar.svelte-1bbyntm:hover{box-shadow:2px 2px 8px 0px steelblue}.container.svelte-1bbyntm{width:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.title.svelte-1bbyntm{position:relative;color:#949a9e;font-size:0.7rem;margin-bottom:0.3rem}.row-left.svelte-1bbyntm{display:flex;flex-direction:row;justify-content:flex-start;align-items:center;text-align:center;flex-wrap:nowrap;align-self:stretch}.value.svelte-1bbyntm{color:#949a9e;opacity:0.5;font-size:0.5rem;margin-left:0.3rem}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG9yaXpvbnRhbC5zdmVsdGUiLCJzb3VyY2VzIjpbIkhvcml6b250YWwuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGltcG9ydCB7IHNldENvbnRleHQsIG9uTW91bnQgfSBmcm9tICdzdmVsdGUnXG4gIGltcG9ydCBsYXlvdXQgZnJvbSAnLi9sYXlvdXQnXG4gIGltcG9ydCB7IHdyaXRhYmxlIH0gZnJvbSAnc3ZlbHRlL3N0b3JlJ1xuICBleHBvcnQgY29uc3QgYmFycyA9IHdyaXRhYmxlKFtdKVxuICBzZXRDb250ZXh0KCdiYXJzJywgYmFycylcbiAgZXhwb3J0IGxldCBsYWJlbCA9ICcnXG4gIGV4cG9ydCBsZXQgbnVtYmVycyA9IGZhbHNlXG4gIGV4cG9ydCBsZXQgbWF4ID0gbnVsbFxuXG4gIGxldCBhcnIgPSBbXVxuICBvbk1vdW50KCgpID0+IHtcbiAgICBhcnIgPSBsYXlvdXQoJGJhcnMsIG1heClcbiAgfSlcbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIC5iYXJjaGFydCB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcbiAgICBhbGlnbi1zZWxmOiBzdHJldGNoO1xuICB9XG4gIC5jb2wge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGFsaWduLXNlbGY6IHN0cmV0Y2g7XG4gIH1cbiAgLmJhcnMge1xuICAgIGZsZXg6IDE7XG4gIH1cbiAgLmxhYmVscyB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIGZsZXg6IDA7XG4gICAgYWxpZ24taXRlbXM6IGZsZXgtZW5kO1xuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICB9XG4gIC5yb3cge1xuICAgIGhlaWdodDogMjBweDtcbiAgICBtYXJnaW4tdG9wOiA1cHg7XG4gICAgbWFyZ2luLWJvdHRvbTogNXB4O1xuICB9XG4gIC5sYWJlbCB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHRvcDogLTFweDtcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcbiAgICBjb2xvcjogI2E2YTRhNDtcbiAgICBmb250LXNpemU6IDE2cHg7XG4gICAgbWFyZ2luLXJpZ2h0OiA1cHg7XG4gICAgbWFyZ2luLWxlZnQ6IDFyZW07XG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIH1cbiAgLmJhciB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICBib3gtc2hhZG93OiAycHggMnB4IDhweCAwcHggcmdiYSgwLCAwLCAwLCAwLjIpO1xuICB9XG4gIC5iYXI6aG92ZXIge1xuICAgIGJveC1zaGFkb3c6IDJweCAycHggOHB4IDBweCBzdGVlbGJsdWU7XG4gIH1cbiAgLmNvbnRhaW5lciB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB9XG4gIC50aXRsZSB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIGNvbG9yOiAjOTQ5YTllO1xuICAgIGZvbnQtc2l6ZTogMC43cmVtO1xuICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTtcbiAgfVxuICAucm93LWxlZnQge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgZmxleC13cmFwOiBub3dyYXA7XG4gICAgYWxpZ24tc2VsZjogc3RyZXRjaDtcbiAgfVxuICAudmFsdWUge1xuICAgIGNvbG9yOiAjOTQ5YTllO1xuICAgIG9wYWNpdHk6IDAuNTtcbiAgICBmb250LXNpemU6IDAuNXJlbTtcbiAgICBtYXJnaW4tbGVmdDogMC4zcmVtO1xuICB9XG48L3N0eWxlPlxuXG48ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gIHsjaWYgbGFiZWx9XG4gICAgPGRpdiBjbGFzcz1cInRpdGxlXCI+e2xhYmVsfTwvZGl2PlxuICB7L2lmfVxuICA8ZGl2IGNsYXNzPVwiYmFyY2hhcnRcIj5cbiAgICA8IS0tIGxhYmVscyAtLT5cbiAgICA8ZGl2IGNsYXNzPVwiY29sIGxhYmVsc1wiPlxuICAgICAgeyNlYWNoIGFyciBhcyBiYXJ9XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyb3cgbGFiZWxcIiBzdHlsZT1cImNvbG9yOntiYXIuY29sb3J9O1wiPlxuICAgICAgICAgIHtAaHRtbCBiYXIubGFiZWx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgey9lYWNofVxuICAgIDwvZGl2PlxuICAgIDwhLS0gYmFycyAtLT5cbiAgICA8ZGl2IGNsYXNzPVwiY29sIGJhcnNcIj5cbiAgICAgIHsjZWFjaCBhcnIgYXMgYmFyfVxuICAgICAgICA8ZGl2IGNsYXNzPVwicm93LWxlZnRcIj5cbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBjbGFzcz1cInJvdyBiYXJcIlxuICAgICAgICAgICAgdGl0bGU9e2Jhci50aXRsZX1cbiAgICAgICAgICAgIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjp7YmFyLmNvbG9yfTsgd2lkdGg6e2Jhci5zaXplfSU7XCIgLz5cbiAgICAgICAgICB7I2lmIG51bWJlcnN9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidmFsdWVcIj57YmFyLnZhbHVlfTwvZGl2PlxuICAgICAgICAgIHsvaWZ9XG4gICAgICAgIDwvZGl2PlxuICAgICAgey9lYWNofVxuICAgIDwvZGl2PlxuXG4gIDwvZGl2PlxuPC9kaXY+XG48c2xvdCAvPlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlCRSxTQUFTLGVBQUMsQ0FBQyxBQUNULFFBQVEsQ0FBRSxRQUFRLENBQ2xCLEtBQUssQ0FBRSxJQUFJLENBQ1gsT0FBTyxDQUFFLElBQUksQ0FDYixjQUFjLENBQUUsR0FBRyxDQUNuQixlQUFlLENBQUUsWUFBWSxDQUM3QixXQUFXLENBQUUsVUFBVSxDQUN2QixVQUFVLENBQUUsS0FBSyxDQUNqQixTQUFTLENBQUUsTUFBTSxDQUNqQixVQUFVLENBQUUsT0FBTyxBQUNyQixDQUFDLEFBQ0QsSUFBSSxlQUFDLENBQUMsQUFDSixPQUFPLENBQUUsSUFBSSxDQUNiLGNBQWMsQ0FBRSxNQUFNLENBQ3RCLGVBQWUsQ0FBRSxNQUFNLENBQ3ZCLFdBQVcsQ0FBRSxVQUFVLENBQ3ZCLFVBQVUsQ0FBRSxNQUFNLENBQ2xCLFNBQVMsQ0FBRSxJQUFJLENBQ2YsVUFBVSxDQUFFLE9BQU8sQUFDckIsQ0FBQyxBQUNELEtBQUssZUFBQyxDQUFDLEFBQ0wsSUFBSSxDQUFFLENBQUMsQUFDVCxDQUFDLEFBQ0QsT0FBTyxlQUFDLENBQUMsQUFDUCxRQUFRLENBQUUsUUFBUSxDQUNsQixJQUFJLENBQUUsQ0FBQyxDQUNQLFdBQVcsQ0FBRSxRQUFRLENBQ3JCLFVBQVUsQ0FBRSxLQUFLLEFBQ25CLENBQUMsQUFDRCxJQUFJLGVBQUMsQ0FBQyxBQUNKLE1BQU0sQ0FBRSxJQUFJLENBQ1osVUFBVSxDQUFFLEdBQUcsQ0FDZixhQUFhLENBQUUsR0FBRyxBQUNwQixDQUFDLEFBQ0QsTUFBTSxlQUFDLENBQUMsQUFDTixRQUFRLENBQUUsUUFBUSxDQUNsQixHQUFHLENBQUUsSUFBSSxDQUNULFVBQVUsQ0FBRSxRQUFRLENBQ3BCLEtBQUssQ0FBRSxPQUFPLENBQ2QsU0FBUyxDQUFFLElBQUksQ0FDZixZQUFZLENBQUUsR0FBRyxDQUNqQixXQUFXLENBQUUsSUFBSSxDQUNqQixZQUFZLENBQUUsSUFBSSxDQUNsQixXQUFXLENBQUUsTUFBTSxBQUNyQixDQUFDLEFBQ0QsSUFBSSxlQUFDLENBQUMsQUFDSixRQUFRLENBQUUsUUFBUSxDQUNsQixhQUFhLENBQUUsR0FBRyxDQUNsQixVQUFVLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQ2hELENBQUMsQUFDRCxtQkFBSSxNQUFNLEFBQUMsQ0FBQyxBQUNWLFVBQVUsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxBQUN2QyxDQUFDLEFBQ0QsVUFBVSxlQUFDLENBQUMsQUFDVixLQUFLLENBQUUsSUFBSSxDQUNYLE9BQU8sQ0FBRSxJQUFJLENBQ2IsY0FBYyxDQUFFLE1BQU0sQ0FDdEIsZUFBZSxDQUFFLE1BQU0sQ0FDdkIsV0FBVyxDQUFFLE1BQU0sQ0FDbkIsVUFBVSxDQUFFLE1BQU0sQUFDcEIsQ0FBQyxBQUNELE1BQU0sZUFBQyxDQUFDLEFBQ04sUUFBUSxDQUFFLFFBQVEsQ0FDbEIsS0FBSyxDQUFFLE9BQU8sQ0FDZCxTQUFTLENBQUUsTUFBTSxDQUNqQixhQUFhLENBQUUsTUFBTSxBQUN2QixDQUFDLEFBQ0QsU0FBUyxlQUFDLENBQUMsQUFDVCxPQUFPLENBQUUsSUFBSSxDQUNiLGNBQWMsQ0FBRSxHQUFHLENBQ25CLGVBQWUsQ0FBRSxVQUFVLENBQzNCLFdBQVcsQ0FBRSxNQUFNLENBQ25CLFVBQVUsQ0FBRSxNQUFNLENBQ2xCLFNBQVMsQ0FBRSxNQUFNLENBQ2pCLFVBQVUsQ0FBRSxPQUFPLEFBQ3JCLENBQUMsQUFDRCxNQUFNLGVBQUMsQ0FBQyxBQUNOLEtBQUssQ0FBRSxPQUFPLENBQ2QsT0FBTyxDQUFFLEdBQUcsQ0FDWixTQUFTLENBQUUsTUFBTSxDQUNqQixXQUFXLENBQUUsTUFBTSxBQUNyQixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (103:2) {#if label}
    function create_if_block_1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*label*/ ctx[1]);
    			attr_dev(div, "class", "title svelte-1bbyntm");
    			add_location(div, file, 103, 4, 1994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(103:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (109:6) {#each arr as bar}
    function create_each_block_1(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = /*bar*/ ctx[8].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			html_tag = new HtmlTag(t);
    			attr_dev(div, "class", "row label svelte-1bbyntm");
    			set_style(div, "color", /*bar*/ ctx[8].color);
    			add_location(div, file, 109, 8, 2142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*arr*/ 8 && raw_value !== (raw_value = /*bar*/ ctx[8].label + "")) html_tag.p(raw_value);

    			if (dirty & /*arr*/ 8) {
    				set_style(div, "color", /*bar*/ ctx[8].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(109:6) {#each arr as bar}",
    		ctx
    	});

    	return block;
    }

    // (123:10) {#if numbers}
    function create_if_block(ctx) {
    	let div;
    	let t_value = /*bar*/ ctx[8].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "value svelte-1bbyntm");
    			add_location(div, file, 123, 12, 2543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*arr*/ 8 && t_value !== (t_value = /*bar*/ ctx[8].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(123:10) {#if numbers}",
    		ctx
    	});

    	return block;
    }

    // (117:6) {#each arr as bar}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let div0_title_value;
    	let t0;
    	let t1;
    	let if_block = /*numbers*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div0, "class", "row bar svelte-1bbyntm");
    			attr_dev(div0, "title", div0_title_value = /*bar*/ ctx[8].title);
    			set_style(div0, "background-color", /*bar*/ ctx[8].color);
    			set_style(div0, "width", /*bar*/ ctx[8].size + "%");
    			add_location(div0, file, 118, 10, 2372);
    			attr_dev(div1, "class", "row-left svelte-1bbyntm");
    			add_location(div1, file, 117, 8, 2339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*arr*/ 8 && div0_title_value !== (div0_title_value = /*bar*/ ctx[8].title)) {
    				attr_dev(div0, "title", div0_title_value);
    			}

    			if (dirty & /*arr*/ 8) {
    				set_style(div0, "background-color", /*bar*/ ctx[8].color);
    			}

    			if (dirty & /*arr*/ 8) {
    				set_style(div0, "width", /*bar*/ ctx[8].size + "%");
    			}

    			if (/*numbers*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(117:6) {#each arr as bar}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let current;
    	let if_block = /*label*/ ctx[1] && create_if_block_1(ctx);
    	let each_value_1 = /*arr*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*arr*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "col labels svelte-1bbyntm");
    			add_location(div0, file, 107, 4, 2084);
    			attr_dev(div1, "class", "col bars svelte-1bbyntm");
    			add_location(div1, file, 115, 4, 2283);
    			attr_dev(div2, "class", "barchart svelte-1bbyntm");
    			add_location(div2, file, 105, 2, 2037);
    			attr_dev(div3, "class", "container svelte-1bbyntm");
    			add_location(div3, file, 101, 0, 1952);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t2, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div3, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*arr*/ 8) {
    				each_value_1 = /*arr*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*arr, numbers*/ 12) {
    				each_value = /*arr*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $bars,
    		$$unsubscribe_bars = noop,
    		$$subscribe_bars = () => ($$unsubscribe_bars(), $$unsubscribe_bars = subscribe(bars, $$value => $$invalidate(7, $bars = $$value)), bars);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_bars());
    	const bars = writable([]);
    	validate_store(bars, "bars");
    	$$subscribe_bars();
    	setContext("bars", bars);
    	let { label = "" } = $$props;
    	let { numbers = false } = $$props;
    	let { max = null } = $$props;
    	let arr = [];

    	onMount(() => {
    		$$invalidate(3, arr = layout($bars, max));
    	});

    	const writable_props = ["label", "numbers", "max"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Horizontal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Horizontal", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("numbers" in $$props) $$invalidate(2, numbers = $$props.numbers);
    		if ("max" in $$props) $$invalidate(4, max = $$props.max);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onMount,
    		layout,
    		writable,
    		bars,
    		label,
    		numbers,
    		max,
    		arr,
    		$bars
    	});

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("numbers" in $$props) $$invalidate(2, numbers = $$props.numbers);
    		if ("max" in $$props) $$invalidate(4, max = $$props.max);
    		if ("arr" in $$props) $$invalidate(3, arr = $$props.arr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bars, label, numbers, arr, max, $$scope, $$slots];
    }

    class Horizontal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1bbyntm-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { bars: 0, label: 1, numbers: 2, max: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Horizontal",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get bars() {
    		return this.$$.ctx[0];
    	}

    	set bars(value) {
    		throw new Error("<Horizontal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Horizontal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Horizontal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numbers() {
    		throw new Error("<Horizontal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numbers(value) {
    		throw new Error("<Horizontal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Horizontal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Horizontal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Vertical.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/Vertical.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-1vakm3c-style";
    	style.textContent = ".barchart.svelte-1vakm3c{position:relative;width:100%;display:flex;flex-direction:row;justify-content:flex-start;align-items:flex-start;text-align:right;flex-wrap:nowrap;align-self:stretch;min-height:50px}.item.svelte-1vakm3c{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;text-align:center;flex-wrap:nowrap;align-self:stretch;margin:5px}.label.svelte-1vakm3c{color:#a6a4a4;min-height:20px;max-height:20px;font-size:12px;width:100%;flex:1;margin-top:0.5rem;text-align:center;opacity:0.7}.bar.svelte-1vakm3c{align-self:center;min-width:20px;width:100%;margin-top:5px;border-radius:2px;box-shadow:2px 2px 8px 0px rgba(0, 0, 0, 0.2)}.bar.svelte-1vakm3c:hover{box-shadow:2px 2px 8px 0px steelblue}.container.svelte-1vakm3c{height:100%;width:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.title.svelte-1vakm3c{position:relative;color:#949a9e;font-size:0.7rem;margin-bottom:0.3rem}.value.svelte-1vakm3c{color:#949a9e;opacity:0.5;font-size:0.5rem}.axis.svelte-1vakm3c{height:90%;top:5%;width:2px;margin-right:5px;background-color:lightgrey}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVydGljYWwuc3ZlbHRlIiwic291cmNlcyI6WyJWZXJ0aWNhbC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgc2V0Q29udGV4dCwgb25Nb3VudCB9IGZyb20gJ3N2ZWx0ZSdcbiAgaW1wb3J0IGxheW91dCBmcm9tICcuL2xheW91dCdcbiAgaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tICdzdmVsdGUvc3RvcmUnXG4gIGV4cG9ydCBjb25zdCBiYXJzID0gd3JpdGFibGUoW10pXG4gIHNldENvbnRleHQoJ2JhcnMnLCBiYXJzKVxuXG4gIGV4cG9ydCBsZXQgbGFiZWwgPSAnJ1xuICBleHBvcnQgbGV0IG1heCA9IG51bGxcbiAgZXhwb3J0IGxldCBheGlzID0gZmFsc2VcbiAgZXhwb3J0IGxldCBoZWlnaHQgPSAnMTAwJSdcbiAgZXhwb3J0IGxldCBudW1iZXJzID0gZmFsc2VcblxuICBsZXQgYXJyID0gW11cbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgYXJyID0gbGF5b3V0KCRiYXJzLCBtYXgpXG4gICAgY29uc29sZS5sb2coYXJyKVxuICB9KVxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgLmJhcmNoYXJ0IHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcbiAgICBhbGlnbi1zZWxmOiBzdHJldGNoO1xuICAgIG1pbi1oZWlnaHQ6IDUwcHg7XG4gIH1cbiAgLml0ZW0ge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgLyogZmxleDogMTsgKi9cbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgZmxleC13cmFwOiBub3dyYXA7XG4gICAgLyogZmxleC1ncm93OiAxOyAqL1xuICAgIGFsaWduLXNlbGY6IHN0cmV0Y2g7XG4gICAgbWFyZ2luOiA1cHg7XG4gICAgLyogb3ZlcmZsb3c6IGhpZGRlbjsgKi9cbiAgfVxuICAubGFiZWwge1xuICAgIGNvbG9yOiAjYTZhNGE0O1xuICAgIG1pbi1oZWlnaHQ6IDIwcHg7XG4gICAgbWF4LWhlaWdodDogMjBweDtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgZmxleDogMTtcbiAgICBtYXJnaW4tdG9wOiAwLjVyZW07XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIG9wYWNpdHk6IDAuNztcbiAgfVxuICAuYmFyIHtcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XG4gICAgbWluLXdpZHRoOiAyMHB4O1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIG1hcmdpbi10b3A6IDVweDtcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XG4gICAgYm94LXNoYWRvdzogMnB4IDJweCA4cHggMHB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcbiAgfVxuICAuYmFyOmhvdmVyIHtcbiAgICBib3gtc2hhZG93OiAycHggMnB4IDhweCAwcHggc3RlZWxibHVlO1xuICB9XG4gIC5jb250YWluZXIge1xuICAgIGhlaWdodDogMTAwJTtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cbiAgLnRpdGxlIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgY29sb3I6ICM5NDlhOWU7XG4gICAgZm9udC1zaXplOiAwLjdyZW07XG4gICAgbWFyZ2luLWJvdHRvbTogMC4zcmVtO1xuICB9XG4gIC52YWx1ZSB7XG4gICAgY29sb3I6ICM5NDlhOWU7XG4gICAgb3BhY2l0eTogMC41O1xuICAgIGZvbnQtc2l6ZTogMC41cmVtO1xuICB9XG4gIC5heGlzIHtcbiAgICBoZWlnaHQ6IDkwJTtcbiAgICB0b3A6IDUlO1xuICAgIHdpZHRoOiAycHg7XG4gICAgbWFyZ2luLXJpZ2h0OiA1cHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogbGlnaHRncmV5O1xuICB9XG48L3N0eWxlPlxuXG48ZGl2IGNsYXNzPVwiY29udGFpbmVyXCIgc3R5bGU9XCJoZWlnaHQ6e2hlaWdodH07XCI+XG4gIHsjaWYgbGFiZWx9XG4gICAgPGRpdiBjbGFzcz1cInRpdGxlXCI+e2xhYmVsfTwvZGl2PlxuICB7L2lmfVxuICA8ZGl2IGNsYXNzPVwiYmFyY2hhcnRcIiBzdHlsZT1cIndpZHRoOjEwMCU7IGhlaWdodDoxMDAlO1wiPlxuICAgIHsjaWYgYXhpc31cbiAgICAgIDxkaXYgY2xhc3M9XCJheGlzXCIgLz5cbiAgICB7L2lmfVxuICAgIHsjZWFjaCBhcnIgYXMgc3RhY2t9XG4gICAgICB7I2VhY2ggc3RhY2sgYXMgYmFyfVxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiIHN0eWxlPVwibWF4LXdpZHRoOntiYXIuc2hhcmV9JTsgbWluLXdpZHRoOntiYXIuc2hhcmV9JTtcIj5cbiAgICAgICAgICB7I2lmIG51bWJlcnN9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidmFsdWVcIj57YmFyLnZhbHVlfTwvZGl2PlxuICAgICAgICAgIHsvaWZ9XG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAgY2xhc3M9XCJiYXJcIlxuICAgICAgICAgICAgdGl0bGU9e2Jhci50aXRsZX1cbiAgICAgICAgICAgIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjp7YmFyLmNvbG9yfTsgaGVpZ2h0OntiYXIuc2l6ZX0lOyBcIiAvPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbFwiIHN0eWxlPVwiY29sb3I6e2Jhci5jb2xvcn07XCI+e2Jhci5sYWJlbCB8fCAnJ308L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICB7L2VhY2h9XG4gICAgey9lYWNofVxuICA8L2Rpdj5cbjwvZGl2PlxuPHNsb3QgLz5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFxQkUsU0FBUyxlQUFDLENBQUMsQUFDVCxRQUFRLENBQUUsUUFBUSxDQUNsQixLQUFLLENBQUUsSUFBSSxDQUNYLE9BQU8sQ0FBRSxJQUFJLENBQ2IsY0FBYyxDQUFFLEdBQUcsQ0FDbkIsZUFBZSxDQUFFLFVBQVUsQ0FDM0IsV0FBVyxDQUFFLFVBQVUsQ0FDdkIsVUFBVSxDQUFFLEtBQUssQ0FDakIsU0FBUyxDQUFFLE1BQU0sQ0FDakIsVUFBVSxDQUFFLE9BQU8sQ0FDbkIsVUFBVSxDQUFFLElBQUksQUFDbEIsQ0FBQyxBQUNELEtBQUssZUFBQyxDQUFDLEFBQ0wsT0FBTyxDQUFFLElBQUksQ0FFYixjQUFjLENBQUUsTUFBTSxDQUN0QixlQUFlLENBQUUsUUFBUSxDQUN6QixXQUFXLENBQUUsTUFBTSxDQUNuQixVQUFVLENBQUUsTUFBTSxDQUNsQixTQUFTLENBQUUsTUFBTSxDQUVqQixVQUFVLENBQUUsT0FBTyxDQUNuQixNQUFNLENBQUUsR0FBRyxBQUViLENBQUMsQUFDRCxNQUFNLGVBQUMsQ0FBQyxBQUNOLEtBQUssQ0FBRSxPQUFPLENBQ2QsVUFBVSxDQUFFLElBQUksQ0FDaEIsVUFBVSxDQUFFLElBQUksQ0FDaEIsU0FBUyxDQUFFLElBQUksQ0FDZixLQUFLLENBQUUsSUFBSSxDQUNYLElBQUksQ0FBRSxDQUFDLENBQ1AsVUFBVSxDQUFFLE1BQU0sQ0FDbEIsVUFBVSxDQUFFLE1BQU0sQ0FDbEIsT0FBTyxDQUFFLEdBQUcsQUFDZCxDQUFDLEFBQ0QsSUFBSSxlQUFDLENBQUMsQUFDSixVQUFVLENBQUUsTUFBTSxDQUNsQixTQUFTLENBQUUsSUFBSSxDQUNmLEtBQUssQ0FBRSxJQUFJLENBQ1gsVUFBVSxDQUFFLEdBQUcsQ0FDZixhQUFhLENBQUUsR0FBRyxDQUNsQixVQUFVLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQ2hELENBQUMsQUFDRCxtQkFBSSxNQUFNLEFBQUMsQ0FBQyxBQUNWLFVBQVUsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxBQUN2QyxDQUFDLEFBQ0QsVUFBVSxlQUFDLENBQUMsQUFDVixNQUFNLENBQUUsSUFBSSxDQUNaLEtBQUssQ0FBRSxJQUFJLENBQ1gsT0FBTyxDQUFFLElBQUksQ0FDYixjQUFjLENBQUUsTUFBTSxDQUN0QixlQUFlLENBQUUsTUFBTSxDQUN2QixXQUFXLENBQUUsTUFBTSxDQUNuQixVQUFVLENBQUUsTUFBTSxBQUNwQixDQUFDLEFBQ0QsTUFBTSxlQUFDLENBQUMsQUFDTixRQUFRLENBQUUsUUFBUSxDQUNsQixLQUFLLENBQUUsT0FBTyxDQUNkLFNBQVMsQ0FBRSxNQUFNLENBQ2pCLGFBQWEsQ0FBRSxNQUFNLEFBQ3ZCLENBQUMsQUFDRCxNQUFNLGVBQUMsQ0FBQyxBQUNOLEtBQUssQ0FBRSxPQUFPLENBQ2QsT0FBTyxDQUFFLEdBQUcsQ0FDWixTQUFTLENBQUUsTUFBTSxBQUNuQixDQUFDLEFBQ0QsS0FBSyxlQUFDLENBQUMsQUFDTCxNQUFNLENBQUUsR0FBRyxDQUNYLEdBQUcsQ0FBRSxFQUFFLENBQ1AsS0FBSyxDQUFFLEdBQUcsQ0FDVixZQUFZLENBQUUsR0FBRyxDQUNqQixnQkFBZ0IsQ0FBRSxTQUFTLEFBQzdCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (99:2) {#if label}
    function create_if_block_2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*label*/ ctx[1]);
    			attr_dev(div, "class", "title svelte-1vakm3c");
    			add_location(div, file$1, 99, 4, 1955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(99:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (103:4) {#if axis}
    function create_if_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "axis svelte-1vakm3c");
    			add_location(div, file$1, 103, 6, 2075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(103:4) {#if axis}",
    		ctx
    	});

    	return block;
    }

    // (109:10) {#if numbers}
    function create_if_block$1(ctx) {
    	let div;
    	let t_value = /*bar*/ ctx[13].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "value svelte-1vakm3c");
    			add_location(div, file$1, 109, 12, 2277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*arr*/ 32 && t_value !== (t_value = /*bar*/ ctx[13].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(109:10) {#if numbers}",
    		ctx
    	});

    	return block;
    }

    // (107:6) {#each stack as bar}
    function create_each_block_1$1(ctx) {
    	let div2;
    	let t0;
    	let div0;
    	let div0_title_value;
    	let t1;
    	let div1;
    	let t2_value = (/*bar*/ ctx[13].label || "") + "";
    	let t2;
    	let t3;
    	let if_block = /*numbers*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(div0, "class", "bar svelte-1vakm3c");
    			attr_dev(div0, "title", div0_title_value = /*bar*/ ctx[13].title);
    			set_style(div0, "background-color", /*bar*/ ctx[13].color);
    			set_style(div0, "height", /*bar*/ ctx[13].size + "%");
    			add_location(div0, file$1, 111, 10, 2340);
    			attr_dev(div1, "class", "label svelte-1vakm3c");
    			set_style(div1, "color", /*bar*/ ctx[13].color);
    			add_location(div1, file$1, 115, 10, 2483);
    			attr_dev(div2, "class", "item svelte-1vakm3c");
    			set_style(div2, "max-width", /*bar*/ ctx[13].share + "%");
    			set_style(div2, "min-width", /*bar*/ ctx[13].share + "%");
    			add_location(div2, file$1, 107, 8, 2166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div2, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (/*numbers*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div2, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*arr*/ 32 && div0_title_value !== (div0_title_value = /*bar*/ ctx[13].title)) {
    				attr_dev(div0, "title", div0_title_value);
    			}

    			if (dirty & /*arr*/ 32) {
    				set_style(div0, "background-color", /*bar*/ ctx[13].color);
    			}

    			if (dirty & /*arr*/ 32) {
    				set_style(div0, "height", /*bar*/ ctx[13].size + "%");
    			}

    			if (dirty & /*arr*/ 32 && t2_value !== (t2_value = (/*bar*/ ctx[13].label || "") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*arr*/ 32) {
    				set_style(div1, "color", /*bar*/ ctx[13].color);
    			}

    			if (dirty & /*arr*/ 32) {
    				set_style(div2, "max-width", /*bar*/ ctx[13].share + "%");
    			}

    			if (dirty & /*arr*/ 32) {
    				set_style(div2, "min-width", /*bar*/ ctx[13].share + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(107:6) {#each stack as bar}",
    		ctx
    	});

    	return block;
    }

    // (106:4) {#each arr as stack}
    function create_each_block$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*stack*/ ctx[10];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*arr, numbers*/ 48) {
    				each_value_1 = /*stack*/ ctx[10];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(106:4) {#each arr as stack}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*label*/ ctx[1] && create_if_block_2(ctx);
    	let if_block1 = /*axis*/ ctx[2] && create_if_block_1$1(ctx);
    	let each_value = /*arr*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const default_slot_template = /*$$slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "barchart svelte-1vakm3c");
    			set_style(div0, "width", "100%");
    			set_style(div0, "height", "100%");
    			add_location(div0, file$1, 101, 2, 1998);
    			attr_dev(div1, "class", "container svelte-1vakm3c");
    			set_style(div1, "height", /*height*/ ctx[3]);
    			add_location(div1, file$1, 97, 0, 1888);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t2, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*axis*/ ctx[2]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*arr, numbers*/ 48) {
    				each_value = /*arr*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*height*/ 8) {
    				set_style(div1, "height", /*height*/ ctx[3]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $bars,
    		$$unsubscribe_bars = noop,
    		$$subscribe_bars = () => ($$unsubscribe_bars(), $$unsubscribe_bars = subscribe(bars, $$value => $$invalidate(9, $bars = $$value)), bars);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_bars());
    	const bars = writable([]);
    	validate_store(bars, "bars");
    	$$subscribe_bars();
    	setContext("bars", bars);
    	let { label = "" } = $$props;
    	let { max = null } = $$props;
    	let { axis = false } = $$props;
    	let { height = "100%" } = $$props;
    	let { numbers = false } = $$props;
    	let arr = [];

    	onMount(() => {
    		$$invalidate(5, arr = layout($bars, max));
    		console.log(arr);
    	});

    	const writable_props = ["label", "max", "axis", "height", "numbers"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Vertical> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Vertical", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("axis" in $$props) $$invalidate(2, axis = $$props.axis);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("numbers" in $$props) $$invalidate(4, numbers = $$props.numbers);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onMount,
    		layout,
    		writable,
    		bars,
    		label,
    		max,
    		axis,
    		height,
    		numbers,
    		arr,
    		$bars
    	});

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("axis" in $$props) $$invalidate(2, axis = $$props.axis);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("numbers" in $$props) $$invalidate(4, numbers = $$props.numbers);
    		if ("arr" in $$props) $$invalidate(5, arr = $$props.arr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bars, label, axis, height, numbers, arr, max, $$scope, $$slots];
    }

    class Vertical extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1vakm3c-style")) add_css$1();

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			bars: 0,
    			label: 1,
    			max: 6,
    			axis: 2,
    			height: 3,
    			numbers: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vertical",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get bars() {
    		return this.$$.ctx[0];
    	}

    	set bars(value) {
    		throw new Error("<Vertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Vertical>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Vertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Vertical>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Vertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get axis() {
    		throw new Error("<Vertical>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set axis(value) {
    		throw new Error("<Vertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Vertical>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Vertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numbers() {
    		throw new Error("<Vertical>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numbers(value) {
    		throw new Error("<Vertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var spencerColor = createCommonjsModule(function (module, exports) {
    !function(e){module.exports=e();}(function(){return function u(i,a,c){function f(r,e){if(!a[r]){if(!i[r]){var o="function"==typeof commonjsRequire&&commonjsRequire;if(!e&&o)return o(r,!0);if(d)return d(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var t=a[r]={exports:{}};i[r][0].call(t.exports,function(e){return f(i[r][1][e]||e)},t,t.exports,u,i,a,c);}return a[r].exports}for(var d="function"==typeof commonjsRequire&&commonjsRequire,e=0;e<c.length;e++)f(c[e]);return f}({1:[function(e,r,o){r.exports={blue:"#6699cc",green:"#6accb2",yellow:"#e1e6b3",red:"#cc7066",pink:"#F2C0BB",brown:"#705E5C",orange:"#cc8a66",purple:"#d8b3e6",navy:"#335799",olive:"#7f9c6c",fuscia:"#735873",beige:"#e6d7b3",slate:"#8C8C88",suede:"#9c896c",burnt:"#603a39",sea:"#50617A",sky:"#2D85A8",night:"#303b50",rouge:"#914045",grey:"#838B91",mud:"#C4ABAB",royal:"#275291",cherry:"#cc6966",tulip:"#e6b3bc",rose:"#D68881",fire:"#AB5850",greyblue:"#72697D",greygreen:"#8BA3A2",greypurple:"#978BA3",burn:"#6D5685",slategrey:"#bfb0b3",light:"#a3a5a5",lighter:"#d7d5d2",fudge:"#4d4d4d",lightgrey:"#949a9e",white:"#fbfbfb",dimgrey:"#606c74",softblack:"#463D4F",dark:"#443d3d",black:"#333333"};},{}],2:[function(e,r,o){var n=e("./colors"),t={juno:["blue","mud","navy","slate","pink","burn"],barrow:["rouge","red","orange","burnt","brown","greygreen"],roma:["#8a849a","#b5b0bf","rose","lighter","greygreen","mud"],palmer:["red","navy","olive","pink","suede","sky"],mark:["#848f9a","#9aa4ac","slate","#b0b8bf","mud","grey"],salmon:["sky","sea","fuscia","slate","mud","fudge"],dupont:["green","brown","orange","red","olive","blue"],bloor:["night","navy","beige","rouge","mud","grey"],yukon:["mud","slate","brown","sky","beige","red"],david:["blue","green","yellow","red","pink","light"],neste:["mud","cherry","royal","rouge","greygreen","greypurple"],ken:["red","sky","#c67a53","greygreen","#dfb59f","mud"]};Object.keys(t).forEach(function(e){t[e]=t[e].map(function(e){return n[e]||e});}),r.exports=t;},{"./colors":1}],3:[function(e,r,o){var n=e("./colors"),t=e("./combos"),u={colors:n,list:Object.keys(n).map(function(e){return n[e]}),combos:t};r.exports=u;},{"./colors":1,"./combos":2}]},{},[3])(3)});
    });

    /* src/Bar.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/Bar.svelte";

    function create_fragment$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$2, 23, 0, 439);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $bars;
    	let { color = "steelblue" } = $$props;
    	let { label = "" } = $$props;
    	let { value = "0" } = $$props;
    	let { title = "" } = $$props;
    	let bars = getContext("bars");
    	validate_store(bars, "bars");
    	component_subscribe($$self, bars, value => $$invalidate(5, $bars = value));
    	let colors = spencerColor.colors;
    	color = colors[color] || color;
    	let stack = getContext("stack");

    	$bars.push({
    		color,
    		value: Number(value),
    		label,
    		title,
    		stack
    	});

    	const writable_props = ["color", "label", "value", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Bar", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		color,
    		label,
    		value,
    		title,
    		bars,
    		c: spencerColor,
    		colors,
    		stack,
    		$bars
    	});

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    		if ("bars" in $$props) $$invalidate(0, bars = $$props.bars);
    		if ("colors" in $$props) colors = $$props.colors;
    		if ("stack" in $$props) stack = $$props.stack;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bars, color, label, value, title];
    }

    class Bar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { color: 1, label: 2, value: 3, title: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bar",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get color() {
    		throw new Error("<Bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Stack.svelte generated by Svelte v3.24.1 */

    function create_fragment$3(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function uuid() {
    	return ("xxxxxx").replace(/[xy]/g, function (c) {
    		var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    		return v.toString(16);
    	});
    }

    function instance$3($$self, $$props, $$invalidate) {
    	setContext("stack", uuid());
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stack> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stack", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ setContext, uuid });
    	return [$$scope, $$slots];
    }

    class Stack extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stack",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* Demo.svelte generated by Svelte v3.24.1 */
    const file$3 = "Demo.svelte";

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-hk15c8-style";
    	style.textContent = ".m4.svelte-hk15c8{margin-top:6rem}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVtby5zdmVsdGUiLCJzb3VyY2VzIjpbIkRlbW8uc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGltcG9ydCB7IEhvcml6b250YWwsIFZlcnRpY2FsLCBCYXIsIFN0YWNrIH0gZnJvbSAnLi9zcmMnXG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICAubTQge1xuICAgIG1hcmdpbi10b3A6IDZyZW07XG4gICAgLyogd2lkdGg6IDUwJTsgKi9cbiAgfVxuPC9zdHlsZT5cblxuPGRpdiBjbGFzcz1cIm1haW4gbTRcIj5cbiAgPGgyPnNvbWVob3ctYmFyY2hhcnQ8L2gyPlxuICA8ZGl2PlxuICAgIGEgc3ZlbHRlIGJhcmNoYXJ0IGNvbXBvbmVudCAtXG4gICAgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9zcGVuY2VybW91bnRhaW4vc29tZWhvdy1iYXJjaGFydFwiIGNsYXNzPVwibTRcIj5naXRodWI8L2E+XG4gIDwvZGl2PlxuICA8IS0tIDxkaXYgY2xhc3M9XCJtNFwiPlxuICAgIDxIb3Jpem9udGFsIGxhYmVsPVwiYnVpbGQgc2l6ZVwiPlxuICAgICAgPEJhciBjb2xvcj1cImxpZ2h0Ymx1ZVwiIGxhYmVsPVwianF1ZXJ5XCIgdmFsdWU9XCI4NFwiIC8+XG4gICAgICA8QmFyIGNvbG9yPVwibGlnaHRibHVlXCIgbGFiZWw9XCJyZWFjdFwiIHZhbHVlPVwiMTQwXCIgLz5cbiAgICAgIDxCYXIgY29sb3I9XCJvcmFuZ2VcIiBsYWJlbD1cImNvbXByb21pc2VcIiB2YWx1ZT1cIjE3MFwiIC8+XG4gICAgICA8QmFyIGNvbG9yPVwibGlnaHRibHVlXCIgbGFiZWw9XCJkM1wiIHZhbHVlPVwiMjMwXCIgLz5cbiAgICAgIDxCYXIgY29sb3I9XCJsaWdodGJsdWVcIiBsYWJlbD1cImVtYmVyXCIgdmFsdWU9XCI0MzVcIiAvPlxuICAgICAgPEJhciBjb2xvcj1cImxpZ2h0Ymx1ZVwiIGxhYmVsPVwiYW5ndWxhclwiIHZhbHVlPVwiNTYwXCIgLz5cbiAgICA8L0hvcml6b250YWw+XG4gIDwvZGl2PiAtLT5cbiAgPGRpdiBjbGFzcz1cIm00IGg4IHc4XCIgc3R5bGU9XCJtYXJnaW46OHJlbTtcIj5cbiAgICA8VmVydGljYWwgbnVtYmVycz17dHJ1ZX0gbGFiZWw9XCJidWlsZCBzaXplOlwiPlxuICAgICAgPFN0YWNrPlxuICAgICAgICA8QmFyIGNvbG9yPVwiYmx1ZVwiIGxhYmVsPVwiZDNcIiB2YWx1ZT1cIjIzMFwiIC8+XG4gICAgICAgIDxCYXIgY29sb3I9XCJvcmFuZ2VcIiBsYWJlbD1cImVtYmVyXCIgdmFsdWU9XCI0MzVcIiAvPlxuICAgICAgPC9TdGFjaz5cbiAgICAgIDxTdGFjaz5cbiAgICAgICAgPEJhciBjb2xvcj1cInJlZFwiIGxhYmVsPVwiYW5ndWxhclwiIHZhbHVlPVwiNTYwXCIgLz5cbiAgICAgICAgPEJhciBjb2xvcj1cImxpZ2h0Ymx1ZVwiIGxhYmVsPVwiZDNcIiB2YWx1ZT1cIjIzMFwiIC8+XG4gICAgICA8L1N0YWNrPlxuICAgICAgPFN0YWNrPlxuICAgICAgICA8QmFyIGNvbG9yPVwibGlnaHRibHVlXCIgbGFiZWw9XCJlbWJlclwiIHZhbHVlPVwiNDM1XCIgLz5cbiAgICAgICAgPEJhciBjb2xvcj1cImxpZ2h0Ymx1ZVwiIGxhYmVsPVwiYW5ndWxhclwiIHZhbHVlPVwiNTYwXCIgLz5cbiAgICAgIDwvU3RhY2s+XG4gICAgPC9WZXJ0aWNhbD5cbiAgPC9kaXY+XG48L2Rpdj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLRSxHQUFHLGNBQUMsQ0FBQyxBQUNILFVBQVUsQ0FBRSxJQUFJLEFBRWxCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    // (30:6) <Stack>
    function create_default_slot_3(ctx) {
    	let bar0;
    	let t;
    	let bar1;
    	let current;

    	bar0 = new Bar({
    			props: { color: "blue", label: "d3", value: "230" },
    			$$inline: true
    		});

    	bar1 = new Bar({
    			props: {
    				color: "orange",
    				label: "ember",
    				value: "435"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(bar0.$$.fragment);
    			t = space();
    			create_component(bar1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bar0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(bar1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bar0.$$.fragment, local);
    			transition_in(bar1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bar0.$$.fragment, local);
    			transition_out(bar1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bar0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(bar1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(30:6) <Stack>",
    		ctx
    	});

    	return block;
    }

    // (34:6) <Stack>
    function create_default_slot_2(ctx) {
    	let bar0;
    	let t;
    	let bar1;
    	let current;

    	bar0 = new Bar({
    			props: {
    				color: "red",
    				label: "angular",
    				value: "560"
    			},
    			$$inline: true
    		});

    	bar1 = new Bar({
    			props: {
    				color: "lightblue",
    				label: "d3",
    				value: "230"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(bar0.$$.fragment);
    			t = space();
    			create_component(bar1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bar0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(bar1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bar0.$$.fragment, local);
    			transition_in(bar1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bar0.$$.fragment, local);
    			transition_out(bar1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bar0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(bar1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(34:6) <Stack>",
    		ctx
    	});

    	return block;
    }

    // (38:6) <Stack>
    function create_default_slot_1(ctx) {
    	let bar0;
    	let t;
    	let bar1;
    	let current;

    	bar0 = new Bar({
    			props: {
    				color: "lightblue",
    				label: "ember",
    				value: "435"
    			},
    			$$inline: true
    		});

    	bar1 = new Bar({
    			props: {
    				color: "lightblue",
    				label: "angular",
    				value: "560"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(bar0.$$.fragment);
    			t = space();
    			create_component(bar1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bar0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(bar1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bar0.$$.fragment, local);
    			transition_in(bar1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bar0.$$.fragment, local);
    			transition_out(bar1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bar0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(bar1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(38:6) <Stack>",
    		ctx
    	});

    	return block;
    }

    // (29:4) <Vertical numbers={true} label="build size:">
    function create_default_slot(ctx) {
    	let stack0;
    	let t0;
    	let stack1;
    	let t1;
    	let stack2;
    	let current;

    	stack0 = new Stack({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	stack1 = new Stack({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	stack2 = new Stack({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(stack0.$$.fragment);
    			t0 = space();
    			create_component(stack1.$$.fragment);
    			t1 = space();
    			create_component(stack2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stack0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(stack1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(stack2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const stack0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				stack0_changes.$$scope = { dirty, ctx };
    			}

    			stack0.$set(stack0_changes);
    			const stack1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				stack1_changes.$$scope = { dirty, ctx };
    			}

    			stack1.$set(stack1_changes);
    			const stack2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				stack2_changes.$$scope = { dirty, ctx };
    			}

    			stack2.$set(stack2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stack0.$$.fragment, local);
    			transition_in(stack1.$$.fragment, local);
    			transition_in(stack2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stack0.$$.fragment, local);
    			transition_out(stack1.$$.fragment, local);
    			transition_out(stack2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stack0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(stack1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(stack2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(29:4) <Vertical numbers={true} label=\\\"build size:\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let h2;
    	let t1;
    	let div0;
    	let t2;
    	let a;
    	let t4;
    	let div1;
    	let vertical;
    	let current;

    	vertical = new Vertical({
    			props: {
    				numbers: true,
    				label: "build size:",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "somehow-barchart";
    			t1 = space();
    			div0 = element("div");
    			t2 = text("a svelte barchart component -\n    ");
    			a = element("a");
    			a.textContent = "github";
    			t4 = space();
    			div1 = element("div");
    			create_component(vertical.$$.fragment);
    			add_location(h2, file$3, 12, 2, 177);
    			attr_dev(a, "href", "https://github.com/spencermountain/somehow-barchart");
    			attr_dev(a, "class", "m4 svelte-hk15c8");
    			add_location(a, file$3, 15, 4, 249);
    			add_location(div0, file$3, 13, 2, 205);
    			attr_dev(div1, "class", "m4 h8 w8 svelte-hk15c8");
    			set_style(div1, "margin", "8rem");
    			add_location(div1, file$3, 27, 2, 784);
    			attr_dev(div2, "class", "main m4 svelte-hk15c8");
    			add_location(div2, file$3, 11, 0, 153);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, t2);
    			append_dev(div0, a);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			mount_component(vertical, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const vertical_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				vertical_changes.$$scope = { dirty, ctx };
    			}

    			vertical.$set(vertical_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(vertical.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(vertical.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(vertical);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Demo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Demo", $$slots, []);
    	$$self.$capture_state = () => ({ Horizontal, Vertical, Bar, Stack });
    	return [];
    }

    class Demo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-hk15c8-style")) add_css$2();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Demo",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    // wire-in query params
    // let user = ''
    // const URLSearchParams = window.URLSearchParams
    // if (typeof URLSearchParams !== undefined) {
    //   const urlParams = new URLSearchParams(window.location.search)
    //   const myParam = urlParams.get('user')
    //   if (myParam) {
    //     user = myParam
    //   }
    // }

    const app = new Demo({
      target: document.body
      // props: { user: user }
    });

    return app;

}());
