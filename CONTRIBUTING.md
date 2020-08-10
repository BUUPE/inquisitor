# Contributing to Inquisitor

## Git Practices

We use the [GitHub Flow](https://guides.github.com/introduction/flow/) branching model. It's pretty straightforward, so give it a read, but basically the idea is that `master` is a protected branch that is never written to directly. Whenever you want to add a feature/fix a bug/etc. you create a new branch off of master, make your changes, and then submit a Pull Request so that code owners can review the changes before merging.

## Code Style

For this project, we use 2 spaces for indentation (almost all text editors will allow you to use your tab key for indentation regardless of whether it's spaces or tabs, or its length). Before starting a PR, make sure your indentation is correct, and all lines have semicolons. To help automate indentation, set up [EditorConfig](https://editorconfig.org/) on your editor. This will automatically setup your editor to use the proper indentation format.

## Libraries

This project uses the [React Bootstrap](https://react-bootstrap.github.io/) design library, so try to use it as much as possible to ensure a uniform look throughout the app (i.e. don't make your own components when React Bootstrap has the same thing). Also, although this means Bootstrap is included in the project, don't use Bootstrap CSS classes/HTML elements. Use the React Bootstrap documentation to find the equivalent React way of doing it to ensure the code is consistent throughout the project. If you do need to modify styling, don't create a CSS file, keep it in the scope of the element you're modifying (i.e. `style={}` prop on the component). If you notice that you're writing the same styles in multiple places, consider abstracting it into a [styled-component](https://styled-components.com/). If you have any questions, please reach out to the code owners.
