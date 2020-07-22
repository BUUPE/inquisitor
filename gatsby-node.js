exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions;
  // Only update the `/admin` page.
  if (page.path.match(/^\/admin/)) {
    // page.matchPath is a special key that's used for matching pages
    // with corresponding routes only on the client.
    page.matchPath = "/admin/*";
    // Update the page.
    createPage(page);
  }
};
