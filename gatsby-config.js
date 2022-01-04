module.exports = {
  siteMetadata: {
    title: `Inquisitor`,
    description: `BU UPE's Interview Tool.`,
    author: `BU UPE`,
    siteUrl: `https://upe.bu.edu/Inquisitor`,
  },
  pathPrefix: `/Inquisitor`,
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Inquisitor`,
        short_name: `Inquisitor`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `${__dirname}/src/images/logo.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `Libre Baskerville`
        ],
        display: 'swap'
      }
    },
    {
      resolve: `gatsby-styled-components-dark-mode`,
      options: {
        light: require(`${__dirname}/src/styles/theme.js`).lightTheme,
        dark: require(`${__dirname}/src/styles/theme.js`).darkTheme,
      },
    },
  ],
};
