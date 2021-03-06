// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  apiKey: 'aYecjavQzV6i679wrL42Tq0FYzKFJTYbi9ko4Yi0',
  apiUrl: 'https://api.nimbldeck.com/v1.0',
  googleAnalyticsKey: 'UA-70280304-1',
  mixpanelKey: 'beb7564b5b6cbc7f88f6f2d8fea20ae1',
  basePath: '/homepage/index.html',
  logoPath: 'https://www.nimbldeck.com/assets/img/nimble-deck-logo.png',
  dashboardReloadInterval: 15000,
  updateCardWarning: 'This card has analytics. Updating the card will reset analytics. Are you sure, you want to update this card?',
  introVideos: {
    create: [
      '//www.youtube.com/watch?v=RcgxMnaOiz0'
    ],
    share: [
      '//www.youtube.com/watch?v=oJGcWAzLGS8'
    ],
    analyse: [
      '//www.youtube.com/watch?v=Q9ll36ayt0c'
    ]
  }
};
