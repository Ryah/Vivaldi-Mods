/*
* Panel Actions (A Mod for Vivaldi)
* LonM.vivaldi.net
* Search actions by tam710562 and joao.rossa on vivaldi.net
* Default zoom figured out by belh4wk on vivaldi.net
* https://forum.vivaldi.net/topic/26623/zoom-other-page-actions-in-web-panels/
* No Copyright Reserved
*/

(function panel_actions(){
    "use strict";

    const ZOOM_STEP = 0.05; /*Step amount. 0.05 is 5%*/
    const DEFAULT_ZOOM = 1.0; /* the default zoom % for webpanels; 0.7 equates to 70%, 1 to 100% */
    const DEFAULT_ZOOM_LBL = DEFAULT_ZOOM * 100; /* the default zoom label based on the default zoom */

    /*
    Dictionary of panel actions.
    They will be added to the toolbar in the order specified below.
    key must be unique
    title: string for tooltip
    script: (target, webview) => {}: void. target is button that was clicked. webview is the webview attached to the button
        for content scripts, Call doContentScript with the webview and a () => {}: void
    display: string of html - The innerHTML of the toolbar button
    display_class: string - One or more classes to give the button
    */

    const ACTIONS_SEARCHTEXT = {
        search_label :{
            title: "Search label",
            script: function(target, webview){

            },
            display:"<span>Find in panel:&nbsp;</span>",
            display_class: "search-label"
        },
        search_input :{

            title: "Search input",
            script: function(target, webview){
                target.addEventListener("input", function() {
                    ACTIONS_SEARCHTEXT.value = target.value;
                    webview.find(ACTIONS_SEARCHTEXT.value);
                });
                target.addEventListener("keypress", function(e) {
                    if (e.keyCode == 13) {
                        if (!e.shiftKey) {
                            webview.find(ACTIONS_SEARCHTEXT.value);
                        } else {
                            webview.find(ACTIONS_SEARCHTEXT.value, { backward: true });
                        }
                    }
                });
            },
            display:"<input type='search' id='panel-search-input'/>",
            display_class: "search-input"
        },

        previous_match : {
            title: "Previous match",
            script: function(target, webview){
                webview.find(ACTIONS_SEARCHTEXT.value, { backward: true });
            },
            display:`<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" d="M5 8L8.63432 4.36568C9.13829 3.86171 10 4.21865 10 4.93137L10 11.0686C10 11.7814 9.13829 12.1383 8.63431 11.6343L5 8Z"></path>
			</svg>`,
            display_class: "previous-match"
        },

        next_match : {
            title: "Next match",
            script: function(target, webview){
                webview.find(ACTIONS_SEARCHTEXT.value);
            },
            display:`<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" d="M11 8L7.36568 11.6343C6.86171 12.1383 6 11.7814 6 11.0686L6 4.93137C6 4.21865 6.86171 3.86171 7.36569 4.36569L11 8Z"></path>
			</svg>`,
            display_class: "next-match"
        },

        cancel_search :{

            title: "Cancel search",
            script: function(target, webview){
                webview.parentElement.parentElement.querySelector("#pamodsearchTextBar").remove();
                webview.stopFinding("clear");
                delete ACTIONS_SEARCHTEXT.value;
            },
            display:`<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
				<path d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L8 6.58579L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L9.41421 8L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L8 9.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L6.58579 8L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z"></path>
			</svg>`,
            display_class: "cancel-search"

        }
    };

    const ACTIONS = {

        zoom_out: {
            title: "Decrease zoom",
            script: function(target, webview){
                webview.getZoom(current => {
                    changeZoom(webview, current -= ZOOM_STEP);
                });
            },
            display: "-",
            display_class: "zoom-out"
        },

        zoom_reset: {
            title: "Set zoom to " + DEFAULT_ZOOM_LBL + "%",
            script: function(target, webview){
                changeZoom(webview, DEFAULT_ZOOM);
            },
            display: DEFAULT_ZOOM_LBL + "%",
            display_class: "zoom-reset"
        },

        zoom_in: {
            title: "Increase zoom",
            script: function(target, webview){
                webview.getZoom(current => {
                    changeZoom(webview, current += ZOOM_STEP);
                });
            },
            display: "+",
            display_class: "zoom-in"
        },

        invert: {
            title: "Invert the colours on the page",
            script: function(target, webview){
                doContentScript(webview, () => {
                    const style_element = document.createElement("style");
                    style_element.innerHTML = `
                        html { background-color: white;}
                        body.inverted {filter: invert(1) hue-rotate(180deg);}
                        body.inverted img,
                        body.inverted video {filter: invert(1) hue-rotate(180deg);}`;
                    document.body.appendChild(style_element);
                    document.body.classList.toggle("inverted");
                });
            },
            display: `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M 7.984375 0 A 7.9850645 7.9850645 0 0 0 0 7.984375 A 7.9850645 7.9850645 0 0 0 7.984375 15.970703 A 7.9850645 7.9850645 0 0 0 15.970703 7.984375 A 7.9850645 7.9850645 0 0 0 7.984375 0 z M 7.9960938 0.74804688 L 7.9960938 7.984375 L 7.9960938 15.222656 A 7.2378569 7.2378569 0 0 1 1.7265625 11.603516 A 7.2378569 7.2378569 0 0 1 1.7265625 4.3652344 A 7.2378569 7.2378569 0 0 1 7.9960938 0.74804688 z " fill=""></path>
            </svg>`,
            display_class: "panel-action-invert"
        },

        terminate: {
            title: "Double-click kills the panel to free memory. WARNING! This will also kill any tabs using the same process.",
            doubleclick: function(target, webview){
                webview.terminate();
                document.querySelector("#switch .webviewbtn.active").click();
            },
            display: "x",
            display_class: "panel-action-terminate"
        },

        mute: {
            title: "Mute this panel",
            script: function(target, webview){
                webview.isAudioMuted(mute => {
                    webview.setAudioMuted(!mute);
                    target.innerHTML = mute ? "<svg viewBox='0 -1 18 18' xmlns='http://www.w3.org/2000/svg'><path d='m 10.425781,0 -5.5410155,4.96094 h -4.234375 v 4.74805 h 4.1074219 l 5.6679686,5.23047 z m 1.767579,1.50782 v 0.59961 c 0.628524,0 1.262682,0.52233 1.751953,1.49023 0.489269,0.96789 0.804686,2.34168 0.804686,3.86133 0,1.51964 -0.315417,2.89148 -0.804686,3.85937 -0.489271,0.9679 -1.123429,1.49219 -1.751953,1.49219 v 0.59961 c 0.949262,0 1.742407,-0.74276 2.287109,-1.82031 0.544702,-1.07756 0.869141,-2.52926 0.869141,-4.13086 0,-1.60161 -0.324439,-3.05525 -0.869141,-4.13281 -0.544702,-1.07755 -1.337847,-1.81836 -2.287109,-1.81836 z m -0.921875,1.97851 v 0.59961 c 0.378754,0 0.787693,0.3227 1.113281,0.9668 0.325586,0.64409 0.539061,1.57016 0.539061,2.5957 1e-6,1.02554 -0.213475,1.95161 -0.539061,2.5957 -0.325588,0.64409 -0.734527,0.9668 -1.113281,0.9668 v 0.59961 c 0.699491,0 1.267416,-0.54311 1.648436,-1.29687 0.381021,-0.75375 0.603517,-1.75774 0.603517,-2.86524 0,-1.1075 -0.222496,-2.11344 -0.603517,-2.86719 -0.38102,-0.75375 -0.948945,-1.29492 -1.648436,-1.29492 z'></path></svg>"
                        : "<svg viewBox='0 -1 18 18' xmlns='http://www.w3.org/2000/svg'><path d='m 10.425781,-0.1412354 -5.5410155,4.96094 H 0.6503908 v 4.75 h 4.1074217 l 5.6679685,5.2285204 z m 0.853516,4.1211 -0.707031,0.70703 1.917969,1.91797 -1.917969,1.91992 0.707031,0.70703 1.917969,-1.91992 1.919922,1.91992 0.707031,-0.70703 -1.919922,-1.91992 1.919922,-1.91797 -0.707031,-0.70703 -1.919922,1.91796 z'></path></svg>";
                    target.title = mute ? "Mute this panel" : "Panel Muted. Click to Un-Mute";
                });
            },
            display: `<svg viewBox="0 -1 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="m 10.425781,0 -5.5410155,4.96094 h -4.234375 v 4.74805 h 4.1074219 l 5.6679686,5.23047 z m 1.767579,1.50782 v 0.59961 c 0.628524,0 1.262682,0.52233 1.751953,1.49023 0.489269,0.96789 0.804686,2.34168 0.804686,3.86133 0,1.51964 -0.315417,2.89148 -0.804686,3.85937 -0.489271,0.9679 -1.123429,1.49219 -1.751953,1.49219 v 0.59961 c 0.949262,0 1.742407,-0.74276 2.287109,-1.82031 0.544702,-1.07756 0.869141,-2.52926 0.869141,-4.13086 0,-1.60161 -0.324439,-3.05525 -0.869141,-4.13281 -0.544702,-1.07755 -1.337847,-1.81836 -2.287109,-1.81836 z m -0.921875,1.97851 v 0.59961 c 0.378754,0 0.787693,0.3227 1.113281,0.9668 0.325586,0.64409 0.539061,1.57016 0.539061,2.5957 1e-6,1.02554 -0.213475,1.95161 -0.539061,2.5957 -0.325588,0.64409 -0.734527,0.9668 -1.113281,0.9668 v 0.59961 c 0.699491,0 1.267416,-0.54311 1.648436,-1.29687 0.381021,-0.75375 0.603517,-1.75774 0.603517,-2.86524 0,-1.1075 -0.222496,-2.11344 -0.603517,-2.86719 -0.38102,-0.75375 -0.948945,-1.29492 -1.648436,-1.29492 z"></path>
            </svg>`,
            display_class: "panel-action-mute"
        },
        search: {
            title: "Search Text",
            script: function(target, webview){
                addSearchTextControls(webview);
            },
            display:`<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
			<path d="M944.448 934.656c-7.552 7.616-19.968 7.616-27.52 0l-124.416-124.352c10.368-8 20.096-16.64 29.12-25.984l122.816 122.752C952.064 914.624 952.064 926.976 944.448 934.656zM638.72 823.616c-118.4 0-214.336-95.872-214.336-214.272 0-118.336 95.936-214.272 214.336-214.272 118.336 0 214.272 95.936 214.272 214.272C852.992 727.744 757.056 823.616 638.72 823.616zM638.72 434.112c-96.832 0-175.36 78.528-175.36 175.296 0 96.832 78.528 175.296 175.36 175.296 96.832 0 175.296-78.528 175.296-175.296C814.08 512.576 735.552 434.112 638.72 434.112zM210.176 745.728l0-38.976 194.752 0c5.696 13.696 12.672 26.624 20.608 38.976L210.176 745.728zM210.176 628.864 210.176 589.888l176.256 0C385.984 596.352 385.472 602.816 385.472 609.344c0 6.656 0.512 13.056 0.96 19.52L210.176 628.864zM210.176 356.16l194.752 0 0 38.912L210.176 395.072 210.176 356.16zM404.992 512 404.992 512 210.176 512 210.176 473.024l194.752 0L404.928 512zM736.128 356.16 638.72 356.16l0 0L638.656 356.16 580.288 356.16c-43.072 0-77.952-34.88-77.952-77.952L502.336 102.976 151.744 102.976c-21.504 0-38.912 17.408-38.912 38.912l0 740.224c0 21.504 17.408 38.848 38.912 38.848l545.408 0c21.504 0 38.912-17.344 38.912-38.848l0-38.976c7.936-3.328 15.68-6.976 23.232-11.008l15.68 15.744 0 34.24c0 43.008-34.88 77.888-77.888 77.888L151.744 960c-43.008 0-77.888-34.88-77.888-77.888L73.856 141.888C73.856 98.88 108.736 64 151.744 64c0 0 149.632 0 292.16 0C447.424 64 450.88 64 454.4 64c6.784 0 13.376 0 20.096 0l54.464 0 240.448 258.944-1.216 6.848 6.848 6.848 0 8.704 0 49.728 0 1.152c-12.288-7.936-25.344-14.912-38.912-20.608L736.128 356.16zM541.312 135.36l0 142.912c0 21.504 17.408 38.976 38.976 38.976l131.584 0L541.312 135.36z" />
			</svg>`,
            display_class: "panel-action-search-text"
        }/*,

        template: {
            title: "",
            script: function(event, webview){

            },
            display: ``,
            display_class: ``
        },*/
    };



    function addSearchTextControls(webview){
        const panel = webview.parentElement.parentElement;
        const alreadyAdded = panel.querySelector("#pamodsearchTextBar");
        if(alreadyAdded){return;}

        const searchTextBar = document.createElement("div");
        searchTextBar.id = "pamodsearchTextBar";
        searchTextBar.className = "toolbar toolbar-medium toolbar-statusbar";
        for(const key in ACTIONS_SEARCHTEXT){
            const action = ACTIONS_SEARCHTEXT[key];
            let newButton;
            if(key === "value") {
                continue;
            } else if(key === "search_label" || key === "search_input") {
                newButton = createElement(action, webview);
            } else {
                newButton = createActionButton(action, webview);
            }
            searchTextBar.appendChild(newButton);
        }
        panel.insertBefore(searchTextBar,panel.querySelector("footer"));
    }

    function createElement(action, webview){
        const template = document.createElement("template");
        template.innerHTML = action.display.trim();
        const element = template.content.firstChild;
        action.script(element, webview);
        element.title = action.title;
        return element;
    }

    /**
     * Change the zoom
     * @param webview to update
     * @param zoom new zoom factor
     */
    function changeZoom(webview, zoom){
        webview.setZoom(zoom, () => {
            updateZoomLabel(webview);
        });
    }

    /**
     * Update the zoom label
     * @param webview to get zoom value from
     */
    function updateZoomLabel(webview){
        const panelZoom = webview.parentElement.parentElement.querySelector(".zoom-reset");
        if(!panelZoom){
            console.error("[lonm-panel-actions] Panel Zoom Label Missing");
            return;
        }
        webview.getZoom(current => {
            const newValue = Math.floor(current * 100);
            panelZoom.firstChild.innerHTML = newValue + "%";
        });
    }

    /**
     * Inject a script as a content script
     * @param webview to use
     * @param scriptMethod Method to inject
     */
    function doContentScript(webview, scriptMethod){
        const scriptText = "("+scriptMethod+")()";
        webview.executeScript({code: scriptText});
    }

    /**
     * Create a panel action button
     * REMARK: For some reason the button click currentTarget is not always the button
     * @param action object
     * @param webview dom object button will attach to
     * @returns dom object
     */
    function createActionButton(action, webview){
        const newBtnDiv = document.createElement("div");
        newBtnDiv.className = action.display_class+" button-toolbar mod-panel-action";
        const newBtn = document.createElement("button");
        newBtn.className = action.display_class+" button-toolbar mod-panel-action";
        newBtn.innerHTML = action.display;
        if(action.script){
            newBtn.addEventListener("click", event => {
                let eventSource = event.target;
                while(eventSource.tagName.toLowerCase()!== "button"){
                    eventSource = eventSource.parentElement;
                }
                action.script(eventSource, webview);
            });
        }
        if(action.doubleclick){
            newBtn.addEventListener("dblclick", event => {
                let eventSource = event.target;
                while(eventSource.tagName.toLowerCase()!== "button"){
                    eventSource = eventSource.parentElement;
                }
                action.doubleclick(eventSource, webview);
            });
        }
        newBtn.title = action.title;
        newBtnDiv.appendChild(newBtn);
        return newBtnDiv;
    }

    /**
     * Add the panel action controls
     * @param panel dom node
     */
    function addPanelControls(panel){
        const alreadyAdded = panel.querySelector("footer");
        if(alreadyAdded){return;}
        const footer = document.createElement("footer");
        const footerToolbar = document.createElement("div");
        footerToolbar.className = "toolbar toolbar-medium toolbar-statusbar";
        footerToolbar.style.height = "24px";
        footerToolbar.style.paddingLeft = "1px";
        footer.appendChild(footerToolbar);
        const webview = panel.querySelector("webview");
        for(const key in ACTIONS){
            const action = ACTIONS[key];
            const newButton = createActionButton(action, webview);
            footerToolbar.appendChild(newButton);
        }
        panel.appendChild(footer);
    }

    /**
     * upgrade a web panel by adding controls, listeners, etc.
     * @param panel dom node
     */
    function upgradePanel(panel){
        addPanelControls(panel);
        const webview = panel.querySelector("webview");
        webview.addEventListener("zoomchange", () => {
            updateZoomLabel(webview);
        });
        webview.addEventListener("loadcommit", () => {
            updateZoomLabel(webview);
        });
        webview.addEventListener("loadstop", () => {
            changeZoom(webview, DEFAULT_ZOOM);
	    	updateZoomLabel(webview);
        });
    }

    /**
     * Observe changes to the panels
     * Remark: This will either be to upgrade a panel when it is first created
     *    or to re-add the panel controls if removed after a panel was toggled
     * This can also re-load a webpanel if it was previously terminated
     */
    const PANEL_CHANGE_OBSERVER = new MutationObserver(records => {
        records.forEach(record => {
            if(record.type==="attributes"){
                const targetClasses = record.target.classList;
                if(targetClasses.contains("visible") && targetClasses.contains("webpanel")){
                    addPanelControls(record.target);
                }
            } else if (record.type==="childList") {
                record.addedNodes.forEach(node => {
                    if(node.classList && node.classList.contains("webpanel")){
                        upgradePanel(node);
                    }
                });
            }
        });
    });

    /**
     * Begin observing the changes to panels
     * @param webPanelStack The web panel stack div
     */
    function beginObservation(webPanelStack){
        PANEL_CHANGE_OBSERVER.observe(webPanelStack, {
            attributes: true,
            attributeFilter: ["class"],
            childList: true,
            subtree: true
        });
    }

    /**
     * Initialise the mod
     */
    function initMod(){
        const webPanels = document.querySelector("#panels");
        if(webPanels){
            beginObservation(webPanels);
            const alreadyOpenPanel = document.querySelector(".panel.webpanel.visible");
            if(alreadyOpenPanel){
                upgradePanel(alreadyOpenPanel);
            }
        } else { setTimeout(initMod, 500); }
    }

    /* Start 500ms after the browser is opened */
    setTimeout(initMod, 500);
})();