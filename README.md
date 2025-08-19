# quickAnalyticsPWA

Provides Data Entry pages for the quickAnalytics Solution.

More details about the solution can be found at this [website](https://quickanalytics.netlify.app/).

## Clone

```sh
git clone https://github.com/LaurenSCarter/quickAnalyticsPWA.git new-repo-name
```

## Update URLS

- This project interacts with a Google Apps Script endpoint to log data.

- It also loads a weekly dashboard from Google Looker Studio.

To update the URLS, see constants.js

## Dashboard

A basic weekly dashboard of entries has been included in the solution.

You should adjust this to point to your own weekly dashboard.

## Time Entries

If a time entry is successfully, you will be notified underneath the Log Time Entry button.

Note: Time entries may take up to 15 minutes to sync through to google looker studio, so they may not appear in your report straight away.

However, if you receive the message it has been added successfully, you can assume it has been added.

Feeling impatient?  Check the google spreadsheet and the logs (if cloud logging has been setup) to double check the entries.

## Adjust Branding

- Add your own icons as needed.  It is a good idea to include a favicon.ico, and a simple manifest of icons.  I included an inverse logo that has been applied to the header of each page.  You may need to directly adjust the icon the header uses in the HTML.

- Colours are easy to update. A basic colour palette is defined in the root: of the CSS. Updating the colours here will propagate throughout the solution.  Note:  Some colours are not in use, but they are provided for extensibility in the future.
