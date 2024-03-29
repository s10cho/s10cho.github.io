(() => {
    const fetchProxy = (url, options, i) => {
        const proxy = [
            '', // try without proxy first
            'https://api.codetabs.com/v1/proxy/?quest='
        ];
        return fetch(proxy[i] + url, options).then(res => {
            if (!res.ok) throw new Error('Cannot load ' + url + ': ' + res.status + ' ' + res.statusText);
            return res.text();
        }).catch(error => {
            if (i === proxy.length - 1) throw error;
            return fetchProxy(url, options, i + 1);
        })
    };
    const loadJS = data => {
        if (data) {
            const script = document.createElement('script');
            script.txt = data;
            console.log(script)
            document.body.appendChild(script);
        }
    };
    const loadCSS = data => {
        if (data) {
            const style = document.createElement('style');
            style.innerHTML = data;
            document.head.appendChild(style);
        }
    };
    const previewForm = document.getElementById('preview');
    const url = location.search.substring(1)
        .replace(/\/\/github\.com/, '//raw.githubusercontent.com')
        .replace(/\/blob\//, '/'); //Get URL of the raw file

    const replaceAssets = () => {
        let frame, a, link, links = [], script, scripts = [], i, href, src;
        //Framesets
        if (document.querySelectorAll('frameset').length)
            return; //Don't replace CSS/JS if it's a frameset, because it will be erased by document.write()
        //Frames
        frame = document.querySelectorAll('iframe[src],frame[src]');
        for (i = 0; i < frame.length; ++i) {
            src = frame[i].src; //Get absolute URL
            if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
                frame[i].src = '//' + location.hostname + location.pathname + '?' + src; //Then rewrite URL so it can be loaded using CORS proxy
            }
        }
        //Links
        a = document.querySelectorAll('a[href]');
        for (i = 0; i < a.length; ++i) {
            href = a[i].href; //Get absolute URL
            if (href.indexOf('#') > 0) { //Check if it's an anchor
                a[i].href = '//' + location.hostname + location.pathname + location.search + '#' + a[i].hash.substring(1); //Then rewrite URL with support for empty anchor
            } else if ((href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) && (href.indexOf('.html') > 0 || href.indexOf('.htm') > 0)) { //Check if it's from raw.github.com or bitbucket.org and to HTML files
                a[i].href = '//' + location.hostname + location.pathname + '?' + href; //Then rewrite URL so it can be loaded using CORS proxy
            }
        }
        //Stylesheets
        link = document.querySelectorAll('link[rel=stylesheet]');
        for (i = 0; i < link.length; ++i) {
            href = link[i].href; //Get absolute URL
            if (href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
                links.push(fetchProxy(href, null, 0)); //Then add it to links queue and fetch using CORS proxy
            }
        }
        Promise.all(links).then(res => {
            res.forEach(item => loadCSS(item));
        });
        //Scripts
        script = document.querySelectorAll('script');
        for (i = 0; i < script.length; ++i) {
            src = script[i].src; //Get absolute URL
            if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) { //Check if it's from raw.github.com or bitbucket.org
                scripts.push(fetchProxy(src, null, 0)); //Then add it to scripts queue and fetch using CORS proxy
            } else {
                script[i].removeAttribute('type');
                scripts.push(script[i].innerHTML); //Add inline script to queue to eval in order
            }
        }
        Promise.all(scripts).then(res => {
            res.forEach(item => loadJS(item));
            document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true, cancelable: true})); //Dispatch DOMContentLoaded event after loading all scripts
        });
    };

    const loadHTML = data => {
        if (data) {
            data = data.replace(/<head([^>]*)>/i, '<head$1><base href="' + url + '">');
            setTimeout(() => {
                document.open();
                document.write(data);
                document.close();
                replaceAssets();
            }, 10); //Delay updating document to have it cleared before
        }
    };

    if (url && url.indexOf(location.hostname) < 0) {
        fetchProxy(url, null, 0).then(loadHTML).catch(error => {
            console.error(error);
            previewForm.style.display = 'block';
            previewForm.innerText = error;
        });
    } else {
        previewForm.style.display = 'block';
    }

})()
