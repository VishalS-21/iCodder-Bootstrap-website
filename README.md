# iCodder — Responsive Bootstrap Learning Website

A multi-page frontend project built with HTML5, CSS3, Bootstrap 5 and vanilla JavaScript. The project demonstrates responsive layouts and practical browser-side interactions without requiring a build step or backend.

## Pages

- `index.html` — Home page with Bootstrap navigation, carousel, cards and demo login/sign-up modals.
- `about.html` — About page.
- `tutorial.html` — Interactive tutorial library with live search, category filters, saved tutorials and completion tracking.
- `contact.html` — Contact form with browser-side validation and a clear demo confirmation.

## Features

- Responsive Bootstrap 5 layout.
- Shared CSS and JavaScript in `assets/`.
- Dark/light theme toggle, with the preference remembered in the current browser.
- Navigation active-state highlighting and working site-wide search that opens the tutorial library.
- Tutorial search and filters for HTML, CSS, JavaScript and Bootstrap.
- Save/unsave tutorial cards and mark learning items complete.
- Learning progress indicator.
- Back-to-top button and keyboard-focus styles.
- Contact form validation.
- No npm install or build step required.

## Project structure

```text
iCodder-Bootstrap-Website/
├── index.html
├── about.html
├── tutorial.html
├── contact.html
├── assets/
│   ├── css/style.css
│   ├── js/script.js
│   └── images/
├── README.md
└── .gitignore
```

## Run locally

1. Extract or clone the repository.
2. Open the folder in VS Code.
3. Open `index.html` directly, or use the VS Code Live Server extension for a local server.
4. An internet connection is required to load Bootstrap from its CDN and open external learning resources.

## Important functionality notes

This is a static frontend demonstration. Saved tutorials, completion status and theme preference use browser `localStorage`, so they stay in the same browser/device and are not user accounts or cloud sync. The contact form validates input but does not send or store messages. Login and sign-up modals are demonstration interfaces only and do not authenticate users. Do not enter real passwords. A backend or trusted form/authentication provider is required for production use.

## Deploy on GitHub Pages

1. Push the contents of this folder to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for the deployment URL shown by GitHub Pages and test every page.

## Technologies

HTML5 · CSS3 · Bootstrap 5 · Vanilla JavaScript

## Ideas for future development

- Connect contact submissions to a backend or form service.
- Add real user authentication only if account-specific learning progress is required.
- Add tutorial detail pages and quizzes.
- Optimize image sizes and run accessibility checks before release.
