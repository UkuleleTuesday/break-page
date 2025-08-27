# Ukulele Tuesday Break Timer - Copilot Instructions

This document provides instructions for GitHub Copilot on how to assist with development in this repository.

## Project Overview

-   **Framework**: This is a single-file application using vanilla JavaScript, HTML, and CSS. All the application logic is contained within `index.html`.
-   **Package Manager**: This project uses `pnpm` for managing dependencies. Dependencies are listed in `package.json`.
-   **Testing**: We use [Playwright](https://playwright.dev/) for visual regression testing. Tests are located in the `tests/` directory.

## Development Guidelines

1.  **Editing Code**: All application code (HTML, CSS, JavaScript) is in `index.html`. When asked to make changes to the application's functionality or appearance, edit this file.
2.  **Adding Tests**: For any new feature or bug fix that affects the UI, a corresponding Playwright test should be added or updated in the `tests/` directory to ensure everything is working as expected. The existing file is `tests/snapshot.spec.ts`. The tests ensure that the application continues to render correctly on the target device (iPad Pro 11).
3.  **Dependencies**: If new Node.js dependencies are needed, add them to `package.json` and remember to use `pnpm`.
4.  **Keep it Simple**: The goal of this project is to remain a simple, single-file application with zero production dependencies. Avoid introducing build steps, frameworks, or complex tooling unless absolutely necessary.
