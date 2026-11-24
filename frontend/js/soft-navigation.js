(function () {
    'use strict';

    if (window.KezzaSoftNavigation) return;

    var COMMON_SCRIPTS = new Set([
        'script.min.js',
        'mobile-menu.min.js',
        'telecrm.min.js',
        'services-navigation.min.js',
        'quick-actions.min.js',
        'scroll-3d.min.js',
        'scanner-launch.min.js',
        'smooth-scroll.min.js',
        'scroll-3d.min.js',
        'translate.min.js',
        'pro-animations.min.js',
        'media-fallbacks.min.js'
    ]);
    var ROUTE_META = [
        ['name', 'description'],
        ['name', 'robots'],
        ['name', 'author'],
        ['name', 'theme-color'],
        ['property', /^og:/],
        ['name', /^twitter:/]
    ];
    var excludedStyles = new Set([
        'fa-subset.min.css',
        'header-pro.css',
        'mobile-perf.css',
        'upgrades-pro.css'
    ]);
    var outlet;
    var routeStyles = new Set();
    var currentRuntime = null;
    var activeRequest = null;
    var navigationSequence = 0;
    var initialRouteLeft = false;
    var routeEventMarker = '__kezzaRouteNavigationHandled';
    var codeCache = new Map();
    var baseUrl = window.location.href;

    function isLocalUrl(value, reference) {
        try {
            return new URL(value, reference).origin === window.location.origin;
        } catch (error) {
            return false;
        }
    }

    function normalizedUrl(value, reference) {
        var url;
        try {
            url = new URL(value, reference);
        } catch (error) {
            return value;
        }
        if (url.origin !== window.location.origin) return value;
        return url.pathname + url.search + url.hash;
    }

    function normalizeShellLinks(referenceUrl) {
        var shellBase = referenceUrl || baseUrl;
        var shell = document.querySelectorAll('.navbar, .footer');
        shell.forEach(function (element) {
            element.querySelectorAll('[href], [src], [poster]').forEach(function (node) {
                ['href', 'src', 'poster'].forEach(function (attribute) {
                    if (!node.hasAttribute(attribute)) return;
                    var value = node.getAttribute(attribute);
                    if (attribute === 'href' && node.classList.contains('btn-drawer-book')) {
                        try {
                            var ctaUrl = new URL(value, shellBase);
                            if (/\/contact\.html$/i.test(ctaUrl.pathname)) {
                                value = '/contact/' + ctaUrl.search + ctaUrl.hash;
                            }
                        } catch (error) {}
                    }
                    node.setAttribute(attribute, normalizedUrl(value, shellBase));
                });
            });
            element.querySelectorAll('[srcset]').forEach(function (node) {
                var srcset = node.getAttribute('srcset').split(',').map(function (candidate) {
                    var parts = candidate.trim().split(/\s+/, 2);
                    parts[0] = normalizedUrl(parts[0], shellBase);
                    return parts.join(' ');
                });
                node.setAttribute('srcset', srcset.join(', '));
            });
        });
    }

    function makeOutlet(nav, footer) {
        if (!nav || !footer || nav.parentNode !== footer.parentNode) return null;
        var wrapper = document.createElement('div');
        wrapper.id = 'kz-route-outlet';
        var node = nav.nextSibling;
        while (node && node !== footer) {
            var next = node.nextSibling;
            if (node.nodeType !== Node.ELEMENT_NODE || node.tagName.toLowerCase() !== 'script') {
                wrapper.appendChild(node);
            } else {
                node.remove();
            }
            node = next;
        }
        nav.parentNode.insertBefore(wrapper, footer);
        return wrapper;
    }

    function prepareSourceContent(sourceDocument, sourceUrl) {
        var nav = sourceDocument.querySelector('.navbar');
        var footer = sourceDocument.querySelector('.footer');
        if (!nav || !footer || nav.parentNode !== footer.parentNode) return null;
        var content = document.createDocumentFragment();
        var scriptNodes = Array.from(sourceDocument.body.querySelectorAll('script')).filter(function (script) {
            return script.type !== 'application/ld+json';
        });
        var node = nav.nextSibling;
        while (node && node !== footer) {
            var next = node.nextSibling;
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'script') {
                node.remove();
            } else {
                content.appendChild(node.cloneNode(true));
            }
            node = next;
        }
        content.querySelectorAll('script').forEach(function (script) { script.remove(); });
        normalizeFragment(content, sourceUrl);
        return { content: content, scripts: scriptNodes };
    }

    function normalizeFragment(fragment, referenceUrl) {
        var elements = [];
        if (fragment.nodeType === Node.ELEMENT_NODE) elements.push(fragment);
        elements.push.apply(elements, Array.from(fragment.querySelectorAll('*')));
        elements.forEach(function (element) {
            ['href', 'src', 'poster', 'action', 'formaction'].forEach(function (attribute) {
                if (element.hasAttribute(attribute)) {
                    element.setAttribute(attribute, normalizedUrl(element.getAttribute(attribute), referenceUrl));
                }
            });
            if (element.hasAttribute('srcset')) {
                var srcset = element.getAttribute('srcset').split(',').map(function (candidate) {
                    var parts = candidate.trim().split(/\s+/, 2);
                    parts[0] = normalizedUrl(parts[0], referenceUrl);
                    return parts.join(' ');
                });
                element.setAttribute('srcset', srcset.join(', '));
            }
        });
    }

    function routeStylesFrom(sourceDocument, sourceUrl) {
        return Array.from(sourceDocument.querySelectorAll('link[rel~="stylesheet"][href]')).map(function (link) {
            return { node: link, href: new URL(link.getAttribute('href'), sourceUrl).href };
        }).filter(function (entry) {
            if (!isLocalUrl(entry.href, sourceUrl)) return false;
            var url = new URL(entry.href, sourceUrl);
            var name = url.pathname.split('/').pop();
            return url.pathname.indexOf('/css/') !== -1 &&
                !excludedStyles.has(name) &&
                (name.indexOf('bundle-') === 0 || name.endsWith('.css'));
        });
    }

    function loadRouteStyles(sourceDocument, sourceUrl) {
        var desired = routeStylesFrom(sourceDocument, sourceUrl);
        var desiredHrefs = new Set(desired.map(function (entry) { return entry.href; }));
        var additions = desired.filter(function (entry) {
            return !Array.from(routeStyles).some(function (existing) {
                return existing.href === entry.href;
            });
        });

        return Promise.all(additions.map(function (entry) {
            return new Promise(function (resolve) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = entry.href;
                link.media = 'print';
                link.dataset.kzRouteStyle = 'true';
                var completed = false;
                var timeoutId;
                var finish = function () {
                    if (completed) return;
                    completed = true;
                    window.clearTimeout(timeoutId);
                    link.media = 'all';
                    routeStyles.add(link);
                    resolve();
                };
                link.addEventListener('load', finish, { once: true });
                link.addEventListener('error', finish, { once: true });
                document.head.appendChild(link);
                timeoutId = window.setTimeout(finish, 3000);
            });
        })).then(function () {
            Array.from(routeStyles).forEach(function (link) {
                if (!desiredHrefs.has(link.href)) {
                    link.remove();
                    routeStyles.delete(link);
                }
            });
        });
    }

    function replaceRouteStyles(sourceDocument) {
        document.querySelectorAll('style[data-kz-route-inline-style]').forEach(function (style) {
            style.remove();
        });
        sourceDocument.head.querySelectorAll('style').forEach(function (sourceStyle) {
            var style = document.createElement('style');
            style.dataset.kzRouteInlineStyle = 'true';
            style.textContent = sourceStyle.textContent;
            document.head.appendChild(style);
        });
    }

    function updateHead(sourceDocument, sourceUrl) {
        document.title = sourceDocument.title || document.title;
        document.documentElement.lang = sourceDocument.documentElement.lang || 'en';

        ROUTE_META.forEach(function (definition) {
            var attribute = definition[0];
            var selectorValue = definition[1];
            var matcher = typeof selectorValue === 'string'
                ? function (value) { return value === selectorValue; }
                : function (value) { return selectorValue.test(value || ''); };
            var sourceMetas = Array.from(sourceDocument.head.querySelectorAll('meta[' + attribute + ']')).filter(function (meta) {
                return matcher(meta.getAttribute(attribute));
            });
            var existingMetas = Array.from(document.head.querySelectorAll('meta[' + attribute + ']')).filter(function (meta) {
                return matcher(meta.getAttribute(attribute));
            });
            sourceMetas.forEach(function (sourceMeta) {
                var key = sourceMeta.getAttribute(attribute);
                var existing = existingMetas.find(function (meta) {
                    return meta.getAttribute(attribute) === key;
                });
                if (!existing) {
                    existing = document.createElement('meta');
                    existing.setAttribute(attribute, key);
                    document.head.appendChild(existing);
                }
                existing.content = sourceMeta.content;
            });
            existingMetas.forEach(function (meta) {
                if (!sourceMetas.some(function (sourceMeta) {
                    return sourceMeta.getAttribute(attribute) === meta.getAttribute(attribute);
                })) meta.remove();
            });
        });

        var canonical = sourceDocument.querySelector('link[rel="canonical"]');
        var liveCanonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            if (!liveCanonical) {
                liveCanonical = document.createElement('link');
                liveCanonical.rel = 'canonical';
                document.head.appendChild(liveCanonical);
            }
            liveCanonical.href = normalizedUrl(canonical.getAttribute('href'), sourceUrl);
        } else if (liveCanonical) {
            liveCanonical.remove();
        }

        document.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
            script.remove();
        });
        sourceDocument.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
            var copy = document.createElement('script');
            copy.type = 'application/ld+json';
            copy.textContent = script.textContent;
            document.head.appendChild(copy);
        });
    }

    function updateActiveNavigation(url) {
        var currentPath = url.pathname.replace(/index\.html$/, '');
        if (!currentPath.endsWith('/') && !/\.[a-z0-9]+$/i.test(currentPath)) currentPath += '/';
        document.querySelectorAll('.nav-menu a[href]').forEach(function (link) {
            var linkUrl;
            try {
                linkUrl = new URL(link.href, window.location.href);
            } catch (error) {
                return;
            }
            var active = linkUrl.origin === url.origin && linkUrl.pathname === currentPath;
            if (!active && currentPath.indexOf('/blog/') === 0) {
                active = linkUrl.pathname === '/blog/';
            }
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    function closeMobileMenu() {
        var menu = document.getElementById('navMenu');
        var hamburger = document.getElementById('hamburger');
        if (menu) menu.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
        var backdrop = document.getElementById('navBackdrop');
        if (backdrop) backdrop.classList.remove('active');
        document.body.classList.remove('nav-drawer-open', 'services-menu-open');
        document.documentElement.classList.remove('nav-drawer-open');
        document.querySelectorAll('.services-dropdown-open, .dropdown-active, .mobile-dropdown-open, .services-mega-open, .mega-active, .mobile-mega-open')
            .forEach(function (element) {
                element.classList.remove('services-dropdown-open', 'dropdown-active', 'mobile-dropdown-open', 'services-mega-open', 'mega-active', 'mobile-mega-open');
            });
        document.querySelectorAll('.services-nav-toggle, .services-mega-toggle').forEach(function (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        });
    }

    function scrollToInstant(top) {
        var root = document.documentElement;
        var previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, Math.max(0, Number(top) || 0));
        root.style.scrollBehavior = previousScrollBehavior;
    }

    function addAbortSignal(options, signal) {
        if (options && typeof options === 'object' && options.signal) return options;
        if (typeof options === 'boolean') return { capture: options, signal: signal };
        return Object.assign({}, options || {}, { signal: signal });
    }

    function createRouteRuntime() {
        var controller = new AbortController();
        var timers = new Set();
        var frames = new Set();
        var observers = new Set();
        var additions = new Set();
        var cleanups = [];
        var originalAdd = EventTarget.prototype.addEventListener;
        var originalRemove = EventTarget.prototype.removeEventListener;
        var originalSetTimeout = window.setTimeout;
        var originalClearTimeout = window.clearTimeout;
        var originalSetInterval = window.setInterval;
        var originalClearInterval = window.clearInterval;
        var originalRequestFrame = window.requestAnimationFrame;
        var originalCancelFrame = window.cancelAnimationFrame;
        var originalIdle = window.requestIdleCallback;
        var originalCancelIdle = window.cancelIdleCallback;
        var originalIntersectionObserver = window.IntersectionObserver;
        var originalMutationObserver = window.MutationObserver;
        var startHead = new Set(document.head.children);
        var startBody = new Set(document.body.children);

        var patchDepth = 0;
        var savedGlobals = null;

        function clearTimer(id, interval, idle) {
            Array.from(timers).forEach(function (timer) {
                if (timer.id === id) timers.delete(timer);
            });
            if (idle && originalCancelIdle) originalCancelIdle.call(window, id);
            else if (interval) originalClearInterval.call(window, id);
            else originalClearTimeout.call(window, id);
        }

        function wrappedCallback(callback) {
            if (typeof callback !== 'function') return callback;
            return function () {
                var context = this;
                var args = arguments;
                return withPatches(function () { return callback.apply(context, args); });
            };
        }

        function patchGlobals() {
            if (patchDepth++ > 0) return;
            savedGlobals = {
                add: EventTarget.prototype.addEventListener,
                setTimeout: window.setTimeout,
                clearTimeout: window.clearTimeout,
                setInterval: window.setInterval,
                clearInterval: window.clearInterval,
                requestAnimationFrame: window.requestAnimationFrame,
                cancelAnimationFrame: window.cancelAnimationFrame,
                requestIdleCallback: window.requestIdleCallback,
                cancelIdleCallback: window.cancelIdleCallback,
                IntersectionObserver: window.IntersectionObserver,
                MutationObserver: window.MutationObserver
            };

            EventTarget.prototype.addEventListener = function (type, listener, options) {
                if (this === controller.signal) {
                    return originalAdd.call(this, type, listener, options);
                }
                if ((this === document || this === window) && (type === 'DOMContentLoaded' || type === 'load')) {
                    type = 'kezza:routechange';
                }
                var scopedListener = listener;
                if (typeof listener === 'function') scopedListener = wrappedCallback(listener);
                else if (listener && typeof listener.handleEvent === 'function') {
                    scopedListener = { handleEvent: wrappedCallback(listener.handleEvent.bind(listener)) };
                }
                if (options && typeof options === 'object' && options.signal) {
                    var target = this;
                    var capture = !!options.capture;
                    originalAdd.call(controller.signal, 'abort', function () {
                        originalRemove.call(target, type, scopedListener, capture);
                    }, { once: true });
                    return originalAdd.call(this, type, scopedListener, options);
                }
                return originalAdd.call(this, type, scopedListener, addAbortSignal(options, controller.signal));
            };

            window.setTimeout = function (callback, delay) {
                var id = originalSetTimeout.apply(window, [wrappedCallback(callback), delay].concat(Array.prototype.slice.call(arguments, 2)));
                timers.add({ id: id, interval: false });
                return id;
            };
            window.clearTimeout = function (id) { clearTimer(id, false, false); };
            window.setInterval = function (callback, delay) {
                var id = originalSetInterval.apply(window, [wrappedCallback(callback), delay].concat(Array.prototype.slice.call(arguments, 2)));
                timers.add({ id: id, interval: true });
                return id;
            };
            window.clearInterval = function (id) { clearTimer(id, true, false); };
            window.requestAnimationFrame = function (callback) {
                var id = originalRequestFrame.call(window, wrappedCallback(callback));
                frames.add(id);
                return id;
            };
            window.cancelAnimationFrame = function (id) {
                frames.delete(id);
                originalCancelFrame.call(window, id);
            };
            if (originalIdle) {
                window.requestIdleCallback = function (callback, options) {
                    var id = originalIdle.call(window, wrappedCallback(callback), options);
                    timers.add({ id: id, interval: false, idle: true });
                    return id;
                };
                window.cancelIdleCallback = function (id) { clearTimer(id, false, true); };
            }

            function trackObserver(Observer) {
                if (!Observer) return Observer;
                return function (callback) {
                    var args = Array.prototype.slice.call(arguments);
                    args[0] = wrappedCallback(callback);
                    var observer = new (Function.prototype.bind.apply(Observer, [null].concat(args)))();
                    observers.add(observer);
                    return observer;
                };
            }
            if (originalIntersectionObserver) window.IntersectionObserver = trackObserver(originalIntersectionObserver);
            if (originalMutationObserver) window.MutationObserver = trackObserver(originalMutationObserver);
        }

        function restoreGlobals() {
            if (!patchDepth || --patchDepth > 0) return;
            EventTarget.prototype.addEventListener = savedGlobals.add;
            window.setTimeout = savedGlobals.setTimeout;
            window.clearTimeout = savedGlobals.clearTimeout;
            window.setInterval = savedGlobals.setInterval;
            window.clearInterval = savedGlobals.clearInterval;
            window.requestAnimationFrame = savedGlobals.requestAnimationFrame;
            window.cancelAnimationFrame = savedGlobals.cancelAnimationFrame;
            if (originalIdle) window.requestIdleCallback = savedGlobals.requestIdleCallback;
            if (originalCancelIdle) window.cancelIdleCallback = savedGlobals.cancelIdleCallback;
            window.IntersectionObserver = savedGlobals.IntersectionObserver;
            window.MutationObserver = savedGlobals.MutationObserver;
            savedGlobals = null;
        }

        function withPatches(callback) {
            patchGlobals();
            try { return callback(); }
            finally { restoreGlobals(); }
        }

        this.run = function (code) {
            var execute = new Function(
                'window', 'document', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
                'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback',
                'IntersectionObserver', 'MutationObserver',
                code
            );
            withPatches(function () {
                execute(
                    window, document, window.setTimeout, window.clearTimeout, window.setInterval, window.clearInterval,
                    window.requestAnimationFrame, window.cancelAnimationFrame, window.requestIdleCallback, window.cancelIdleCallback,
                    window.IntersectionObserver, window.MutationObserver
                );
            });
        };

        this.dispatch = function () {
            document.dispatchEvent(new Event('kezza:routechange'));
            window.dispatchEvent(new Event('kezza:routechange'));
        };

        this.finish = function () {
            while (patchDepth) restoreGlobals();

            Array.from(document.head.children).forEach(function (element) {
                if (!startHead.has(element) && (element.tagName === 'STYLE' || element.tagName === 'LINK')) additions.add(element);
            });
            Array.from(document.body.children).forEach(function (element) {
                if (!startBody.has(element) && element !== outlet) additions.add(element);
            });
            additions.forEach(function (element) {
                cleanups.push(function () {
                    if (element.parentNode) element.remove();
                });
            });

            return function () {
                controller.abort();
                timers.forEach(function (timer) {
                    if (timer.idle && originalCancelIdle) originalCancelIdle.call(window, timer.id);
                    else if (timer.interval) originalClearInterval.call(window, timer.id);
                    else originalClearTimeout.call(window, timer.id);
                });
                frames.forEach(function (id) { originalCancelFrame.call(window, id); });
                observers.forEach(function (observer) { observer.disconnect(); });
                cleanups.forEach(function (cleanup) { cleanup(); });
            };
        };
    }

    function routeInlineHandlerNames(sourceDocument) {
        var names = new Set();
        sourceDocument.body.querySelectorAll('*').forEach(function (element) {
            Array.from(element.attributes).forEach(function (attribute) {
                if (!/^on/i.test(attribute.name)) return;
                var match;
                var pattern = /\b([A-Za-z_$][\w$]*)\s*\(/g;
                while ((match = pattern.exec(attribute.value))) names.add(match[1]);
            });
        });
        return names;
    }

    function isTrackingScript(script) {
        var source = (script.textContent || '').trim();
        return !source || source.indexOf('googletagmanager.com') !== -1 ||
            source.indexOf('gtag(') !== -1 ||
            source.indexOf('footer-year') !== -1;
    }

    async function loadRouteCode(sourceDocument, scripts, sourceUrl) {
        var routeCode = [];
        for (var index = 0; index < scripts.length; index += 1) {
            var script = scripts[index];
            if (script.hasAttribute('src')) {
                var scriptUrl = new URL(script.getAttribute('src'), sourceUrl);
                if (scriptUrl.origin !== window.location.origin) continue;
                var filename = scriptUrl.pathname.split('/').pop();
                if (!filename.endsWith('.js') || COMMON_SCRIPTS.has(filename)) continue;
                if (!initialRouteLeft && scriptUrl.origin === window.location.origin &&
                    Array.from(document.scripts).some(function (loadedScript) {
                        return loadedScript.src && new URL(loadedScript.src).href === scriptUrl.href;
                    })) continue;
                try {
                    if (!codeCache.has(scriptUrl.href)) {
                        codeCache.set(scriptUrl.href, fetch(scriptUrl.href).then(function (response) {
                            if (!response.ok) throw new Error('Could not load page script');
                            return response.text();
                        }));
                    }
                    routeCode.push(await codeCache.get(scriptUrl.href));
                } catch (error) {
                    codeCache.delete(scriptUrl.href);
                    console.error('Kezza page script failed to load', scriptUrl.href, error);
                }
            } else if (script.type !== 'application/ld+json' && !isTrackingScript(script)) {
                routeCode.push(script.textContent || '');
            }
        }

        var runtime = new createRouteRuntime();
        var globalHandlers = routeInlineHandlerNames(sourceDocument);
        routeCode.forEach(function (code) {
            var exports = [];
            globalHandlers.forEach(function (name) {
                if (new RegExp('\\bfunction\\s+' + name + '\\s*\\(').test(code)) {
                    exports.push('window[' + JSON.stringify(name) + '] = ' + name + ';');
                }
            });
            try {
                runtime.run(code + '\n' + exports.join('\n'));
            } catch (error) {
                console.error('Kezza inline page behavior failed', error);
            }
        });
        runtime.dispatch();
        var dispose = runtime.finish();
        return dispose;
    }

    function prepareInitialPage() {
        var nav = document.querySelector('.navbar');
        var footer = document.querySelector('.footer');
        if (!nav || !footer) return false;
        outlet = document.getElementById('kz-route-outlet') || makeOutlet(nav, footer);
        if (!outlet) return false;
        routeStyles = new Set(Array.from(document.head.querySelectorAll('link[rel~="stylesheet"][href]')).filter(function (link) {
            var name = new URL(link.href, window.location.href).pathname.split('/').pop();
            return name.indexOf('bundle-') === 0 ||
                (new URL(link.href, window.location.href).pathname.indexOf('/css/') !== -1 && !excludedStyles.has(name));
        }));
        normalizeShellLinks();

        var style = document.createElement('style');
        style.id = 'kz-soft-navigation-style';
        style.textContent = [
            '#kz-soft-nav-progress{position:fixed;z-index:10001;top:0;left:0;width:100%;height:3px;pointer-events:none;opacity:0;transition:opacity .18s ease}',
            '#kz-soft-nav-progress::before{content:"";display:block;width:100%;height:100%;background:#00afc0;transform:scaleX(0);transform-origin:left;transition:transform .22s ease}',
            '#kz-soft-nav-progress.is-loading{opacity:1}',
            '#kz-soft-nav-progress.is-loading::before{transform:scaleX(.68)}',
            '#kz-route-outlet{transition:opacity .16s ease}',
            '#kz-route-outlet.is-loading{opacity:.62}',
            '@media(prefers-reduced-motion:reduce){#kz-route-outlet{transition:none}}'
        ].join('');
        document.head.appendChild(style);

        var progress = document.createElement('div');
        progress.id = 'kz-soft-nav-progress';
        progress.setAttribute('aria-hidden', 'true');
        document.body.appendChild(progress);
        history.replaceState(Object.assign({}, history.state || {}, {
            kzSoftNavigation: true,
            kzScrollY: window.scrollY,
            kzScrollRestore: true
        }), '', window.location.href);
        return true;
    }

    function setProgress(active) {
        var progress = document.getElementById('kz-soft-nav-progress');
        if (progress) progress.classList.toggle('is-loading', active);
        if (outlet) outlet.classList.toggle('is-loading', active);
    }

    function loadRouteImages() {
        if (window.KezzaQuickActions && typeof window.KezzaQuickActions.refresh === 'function') {
            window.KezzaQuickActions.refresh();
        }
        if (window.KezzaMediaFallbacks && typeof window.KezzaMediaFallbacks.refresh === 'function') {
            window.KezzaMediaFallbacks.refresh();
        }
        if (window.KezzaProAnimations && typeof window.KezzaProAnimations.refresh === 'function') {
            window.KezzaProAnimations.refresh();
        }
        if (window.KezzaSmoothScroll && typeof window.KezzaSmoothScroll.refresh === 'function') {
            window.KezzaSmoothScroll.refresh();
        }
    }

    function trackPageView(url) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'page_view',
            page_path: url.pathname + url.search,
            page_title: document.title
        });
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_path: url.pathname + url.search,
                page_title: document.title
            });
        }
    }

    async function navigate(targetUrl, options) {
        var settings = options || {};
        var requestId = ++navigationSequence;
        if (activeRequest) activeRequest.abort();
        activeRequest = new AbortController();
        setProgress(true);

        try {
            var response = await fetch(targetUrl.href, {
                signal: activeRequest.signal,
                credentials: 'same-origin',
                headers: { 'X-Kezza-Soft-Navigation': '1' }
            });
            if (!response.ok || requestId !== navigationSequence) throw new Error('Page request failed');
            var finalUrl = new URL(response.url);
            finalUrl.hash = targetUrl.hash;
            if (finalUrl.origin !== window.location.origin) throw new Error('Page redirected outside this website');

            var html = await response.text();
            var sourceDocument = new DOMParser().parseFromString(html, 'text/html');
            var prepared = prepareSourceContent(sourceDocument, finalUrl.href);
            if (!prepared) throw new Error('This page uses a separate layout');

            await loadRouteStyles(sourceDocument, finalUrl.href);
            if (requestId !== navigationSequence) return;

            if (settings.push) {
                history.replaceState(Object.assign({}, history.state || {}, {
                    kzSoftNavigation: true,
                    kzScrollY: window.scrollY,
                    kzScrollRestore: true
                }), '', window.location.href);
                history.pushState({
                    kzSoftNavigation: true,
                    kzScrollY: 0,
                    kzScrollRestore: false
                }, '', finalUrl.pathname + finalUrl.search + finalUrl.hash);
            } else if (finalUrl.href !== window.location.href) {
                history.replaceState(Object.assign({}, history.state || {}, { kzSoftNavigation: true }), '', finalUrl.pathname + finalUrl.search + finalUrl.hash);
            }

            if (currentRuntime) currentRuntime();
            currentRuntime = null;
            closeMobileMenu();
            var persistentBodyClasses = Array.from(document.body.classList).filter(function (name) {
                return /^(?:kezza-chat|ks-modal|kz-modal|nav-drawer|services-menu|is-scrolling)/.test(name);
            });
            outlet.replaceChildren(prepared.content);
            document.body.className = sourceDocument.body.className;
            persistentBodyClasses.forEach(function (name) { document.body.classList.add(name); });
            updateHead(sourceDocument, finalUrl.href);
            replaceRouteStyles(sourceDocument);
            updateActiveNavigation(new URL(window.location.href));
            baseUrl = finalUrl.href;
            normalizeShellLinks(baseUrl);
            try {
                currentRuntime = await loadRouteCode(sourceDocument, prepared.scripts, finalUrl.href);
            } catch (error) {
                console.error('Kezza route behavior could not start', error);
            }

            loadRouteImages();
            initialRouteLeft = true;

            if (requestId !== navigationSequence) return;
            var destination = new URL(window.location.href);
            if (!settings.push && settings.restoreScroll && Number.isFinite(settings.scrollY)) {
                scrollToInstant(settings.scrollY);
            } else if (destination.hash) {
                var target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
                if (target) target.scrollIntoView({ block: 'start' });
                else scrollToInstant(0);
            } else if (!settings.push && Number.isFinite(settings.scrollY)) {
                scrollToInstant(settings.scrollY);
            } else {
                scrollToInstant(0);
            }

            var heading = outlet.querySelector('h1');
            if (heading) {
                if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
                heading.focus({ preventScroll: true });
            }
            trackPageView(destination);
        } catch (error) {
            if (error.name === 'AbortError') return;
            if (requestId === navigationSequence && settings.fallback !== false) {
                window.location.assign(targetUrl.href);
                return;
            }
            if (requestId === navigationSequence) console.error('Kezza soft navigation failed', error);
        } finally {
            if (requestId === navigationSequence) {
                setProgress(false);
                activeRequest = null;
            }
        }
    }

    function shouldHandleLink(event, link) {
        if (!link || event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
        if (link.hasAttribute('download') || link.hasAttribute('data-no-soft-navigation') ||
            (link.target && link.target.toLowerCase() !== '_self')) return false;
        if (link.closest('.services-nav-toggle, .services-mega-toggle, [data-open-scanner-modal], .nav-scanner-link')) return false;

        var href = link.getAttribute('href') || '';
        if (!href || /^(?:#|javascript:|mailto:|tel:|sms:)/i.test(href)) return false;
        var url;
        try {
            url = new URL(href, window.location.href);
        } catch (error) {
            return false;
        }
        if (url.origin !== window.location.origin || /\/face-scanner(?:\.html|\/|$)/i.test(url.pathname)) return false;
        if (/^\/api(?:\/|$)/i.test(url.pathname) || /\.(?:pdf|zip|rar|7z|docx?|xlsx?|pptx?|mp4|webm|mp3|wav|jpe?g|png|gif|webp|svg|ico)$/i.test(url.pathname)) return false;
        return true;
    }

    function onLinkClick(event) {
        var link = event.target.closest('a[href]');
        if (event[routeEventMarker] || !shouldHandleLink(event, link)) return;
        var targetUrl = new URL(link.href, window.location.href);
        if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
            if (!targetUrl.hash) {
                event[routeEventMarker] = true;
                event.preventDefault();
                closeMobileMenu();
            }
            return;
        }
        event[routeEventMarker] = true;
        event.preventDefault();
        closeMobileMenu();
        navigate(targetUrl, { push: true, fallback: true });
    }

    function onPopState(event) {
        if (event[routeEventMarker]) return;
        event[routeEventMarker] = true;
        var currentUrl = new URL(window.location.href);
        if (event.state && Number.isFinite(event.state.kzScrollY)) {
            navigate(currentUrl, {
                push: false,
                scrollY: event.state.kzScrollY,
                restoreScroll: event.state.kzScrollRestore !== false,
                fallback: true
            });
        } else {
            navigate(currentUrl, { push: false, fallback: true });
        }
    }

    function start() {
        if (!prepareInitialPage()) return;
        document.addEventListener('click', onLinkClick, true);
        // Run ahead of legacy route listeners and claim each history event once.
        window.addEventListener('popstate', onPopState, true);
        history.scrollRestoration = 'manual';
        window.KezzaSoftNavigation = {
            navigate: function (url) {
                navigate(new URL(url, window.location.href), { push: true, fallback: true });
            }
        };
    }

    start();
})();
