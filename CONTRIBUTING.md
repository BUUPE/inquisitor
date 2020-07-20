# Contributing to Inquisitor

## Git Practices

Before contributing, note that we use the [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model. Please read that article in its entirety if you are unfamiliar with the concept. Also, if you don't have the bindings installed already, you can get them [here](https://github.com/nvie/gitflow/wiki/Installation). If you need a quick refresher on Git Flow, check out this [cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/). If you haven't already done so, run `git flow init -d` in the project root. This will setup your local repository to match the branching model of the remote (`master` and `develop` with feature branches etc.). Make sure you follow the Git Flow model when making any features/changes (you won't have access to push changes directly to `master` or `develop` anyways).

Note that you don't need the Git Flow bindings to follow the branching model. Essentially, whenever you are starting a new feature, grab the latest changes to `develop` and branch off it:

```
git checkout develop
git pull
git checkout -b feature/<NEW_FEATURE_NAME>
```

You can `git commit` and `git push` as normal on your feature branch. However, one caveat from the normal Git Flow model is that you can't use `git flow feature finish`. What that command does is merge your feature branch into `develop`, however you won't have write access to `develop`, which will prevent you from pushing your changes. Instead, when you are done with your feature, grab the latest changes to `develop`, merge them in to your branch, and push your changes:

```
git fetch origin develop:develop
git merge develop
git push
```

Merging `develop` before pushing makes sure you're not behind on any upadtes and will save a step during the pull request if merge conflicts occur. After your feature branch is pushed, go to GitHub and make a pull request from your branch into `develop` (`develop` should be set as the base). Once the PR passes code review, it will be merged in. After enough new features are added to `develop`, a PR will be made from `develop` into `master` (this can be considered a "release candidate"), after which a final round of reviews/bugfixes are made before merging.

## Code Style

For this project, we use 2 spaces for indentation (almost all text editors will allow you to use your tab key for indentation regardless of whether it's spaces or tabs, or its length). Before starting a PR, make sure your indentation is correct, and all lines have semicolons. To help automate indentation, set up [EditorConfig](https://editorconfig.org/) on your editor. This will automatically setup your editor to use the proper indentation format.

## Libraries

This project uses the [React Bootstrap](https://react-bootstrap.github.io/) design library, so try to use it as much as possible to ensure a uniform look throughout the app (i.e. don't make your own components when React Bootstrap has the same thing). Also, although this means Bootstrap is included in the project, don't use Bootstrap CSS classes/HTML elements. Use the React Bootstrap documentation to find the equivalent React way of doing it to ensure the code is consistent throughout the project. Reading through the list of available components would be a good first step.

If you have any questions, please reach out to @ROODAY or @Warren-Partridge.
