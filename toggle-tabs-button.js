(function () {
    // ============================================================================================================
    // Toggle tabs button for the navigation area of the address bar
    // URL:         https://forum.vivaldi.net/post/555476
    // Description: Adds a navigation bar button that will toggle the visibility of the tab bar
    // Author(s):   @nomadic
    // CopyRight:   No Copyright Reserved
    // ============================================================================================================
    function toggleTabsButton() {
      function toggleTabs() {
        // get initial value
        vivaldi.prefs.get("vivaldi.tabs.visible", (isVisible) => {
          vivaldi.prefs.set({ path: "vivaldi.tabs.visible", value: !isVisible });
        });
      }
  
      function addTabToggleButton() {
        const addressBar = document.querySelector(".mainbar > .toolbar-mainbar.toolbar-droptarget");
        const urlField = document.querySelector(".UrlBar-AddressField");
        const oldButton = document.getElementById("toggleTabsBtn");
  
        // check if already exists and elements are valid
        if (oldButton || !addressBar || !urlField) return;
  
        const toggleTabsBtn = document.createElement("div");
        toggleTabsBtn.id = "toggleTabsBtn";
        toggleTabsBtn.classList.add("button-toolbar");
        toggleTabsBtn.innerHTML = `
          <button draggable="false" tabindex="-1" title="Toggle tab bar" type="button" class="ToolbarButton-Button" name="Bookmarks">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
                <path fill-rule="evenodd" d="M19 8H7a1 1 0 0 0-1 1v2h14V9a1 1 0 0 0-1-1zM6 17v-5h14v5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM7 7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm4 2H7v1h4z"/>
              </svg>
            <span>
          </button>
        `;
  
        addressBar.insertBefore(toggleTabsBtn, urlField);
  
        toggleTabsBtn.addEventListener("click", toggleTabs);
      }
  
      // ==============================================================================
      // Mutation Observer for Address Bar Changes
      // ==============================================================================
      let main = document.getElementsByClassName("mainbar")[0];
      // get the initial state of the addressbar as either urlbar or mailbar
      let oldIsMailBarActive = main.firstChild.classList.contains("toolbar-mailbar");
      let addressBarObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          // only re-add on new nodes added. The list addedNodes will only have a
          // length attribute when it contains added nodes
          if (mutation.addedNodes.length) {
            // get the new state of the addressbar
            let isMailBarActive = mutation.addedNodes[0].classList.contains("toolbar-mailbar");
  
            // if it is different from the previous state, we need to act on it
            if (oldIsMailBarActive !== isMailBarActive) {
              // update the old value for comparisons on future mutations
              oldIsMailBarActive = isMailBarActive;
              // if the addressbar isn't the mailbar, we can re-add the button
              if (!isMailBarActive) {
                // Run all changes that are only in the url bar and not the mail bar
                addTabToggleButton();
              }
            }
          }
        });
      });
      addressBarObserver.observe(main, { childList: true });
  
      addTabToggleButton();
    }
  
    let intervalID = setInterval(() => {
      const browser = document.getElementById("browser");
      if (browser) {
        clearInterval(intervalID);
        toggleTabsButton();
      }
    }, 300);
  })();