// this is used to have lists in the sidebar shown with the id attached
const navItems = [
  { id: "general", label: "General" },
  { id: "account", label: "Account" },
  { id: "appearance", label: "Appearance" },
  { id: "security", label: "Security" },
];

// this stors all important DOM elements in one object for easy access
const elements = {
  nav: document.querySelector("#settings-nav"),
  panels: document.querySelectorAll(".settings-panel"),
  search: document.querySelector("#settings-search"),
  themeToggle: document.querySelector("#theme-toggle"),
  deleteButton: document.querySelector("#delete-account-btn"),
};

// this is used to store the searchable settings elements
let searchIndex = [];

// this tracks which page you are on, starting you off in general
let currentPanel = "general";

// this is used to create navigation fo the sidebar
const renderNav = (items = navItems) => {
  elements.nav.replaceChildren();
  /* this makes the search display as empty properly if the search
  is empty */
  if (!items.length) {
    const empty = document.createElement("div");
    empty.textContent = "No results";
    empty.className = "settings-empty";
    elements.nav.append(empty);
    return;
  }
  
  /* this makes performance better as the setting is quite intensive
  this will create the dom quickly first, and then create it 
  together when its actually needed */
  const fragment = document.createDocumentFragment();

  // This creates a button for each nav item
  items.forEach(item => {
    const button = document.createElement("button");
    button.textContent = item.label;
    button.dataset.panel = item.id;

    /* this is used to highlight the tab using the css to change it 
     quickly */
    if (item.id === currentPanel) {
      button.classList.add("active");
    }
    fragment.append(button);

  });
  // this adds the buttons from the fragment making it perform better
  elements.nav.append(fragment);
};

// this will allow the page to switch from different tabs
const showPanel = panelId => {
  currentPanel = panelId;
  elements.panels.forEach(panel => {
    panel.classList.toggle("active", panel.id === panelId);
  });

  // this updates the states for the sidebar button
  elements.nav
  .querySelectorAll("button")
  .forEach(button => {
    button.classList.toggle("active", button.dataset.panel === panelId);
  });
};

// this creates a searchable list for the settings 
const buildSearchIndex = () => {
  searchIndex =
    [...elements.panels].flatMap(panel => {return [
          ...panel.querySelectorAll(".settings-row")
        ]
        .map(row => {
          const label = row.querySelector("label");
          if (!label) return null;
          return {
            /* the text will be the searchable text in lowercase to 
            make sure it find the value more accessability */
            text: label.textContent.toLowerCase(), 
            // the panel is the tab the search belongs to
            panel: panel.id,
            /* this just saves the page so it can be saved for 
            changing things, eg highlighting the settings or 
            allowing scrolling if large enough */
            element: row, 
          };
        })
        .filter(Boolean); // this removes all null values
        });
      };
// this is used to filter out everything not needed in the search
const searchSettings = query => {
  const q = query.trim().toLowerCase();
  // if the search is empty, the list is rest
  if (!q) {
    renderNav();
    return;
  }
  // this is used to find searches that actually align 
  const matches = searchIndex.filter(item =>item.text.includes(q));
  // this gets the search input and converts them for the nav items
  renderNav(
    matches.map(match => ({
      id: match.panel,
      label: match.text,
    }))
  );
};

// this highlights an element for 800s when this is called on
const highlight = element => {
  element.classList.add("highlight");
  setTimeout(() => {element.classList.remove("highlight");}, 800);
};
/* this makes the nav bar change the tab you are on instead of 
having a different webpage, which can be annoying as if you want 
to go back out of the settings, youd have to go back each tab, 
however this change fixes this */
elements.nav.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  const panelId = button.dataset.panel;
  // this switches to the tab you want
  showPanel(panelId);
  /* this highlights the first matching result to let you quickly 
  know it has changed */
  const match = searchIndex.find(item => item.panel === panelId);
  if (match) {
    highlight(match.element);
  }
});

// this starts searching when the user adds an input in the textbox
elements.search.addEventListener("input", event => {
  searchSettings(event.target.value);
});

// this allows the user to change from light to dark mode
elements.themeToggle.addEventListener("change", event => {
  document.body.classList.toggle("dark",event.target.checked);
});

// this asks for confirmation to delete the account as a demo 
elements.deleteButton.addEventListener("click", () => {
  const confirmed = confirm("Delete account?");
  if (!confirmed) return;
  alert("Deleted (demo)");
});

// this renders the sidebar, search info, and makes it ready to use
renderNav();
buildSearchIndex();

/* this make a note in the console to tell the devs it worked this 
is helpful for me when creating, but anyone reading this should 
learn from this to do this for debugging code */
console.log("Settings loaded successfully");