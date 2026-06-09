The WC2026  is a SPA that will provide the matches schedules and additional information available in free resources.
The available resources for World cup 2026:
 * Teams (file contains bidirectional or hidden Unicode text): https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.teams.json
 * Teams by group: https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.groups.json
 * matches schedules: https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json
 

 The application should fetch those resources to provide the following sections:
  * Teams: Shows entries as cards (name, continent, flag icon, group, confed). It should be possible to filter by continent and confed. Search by name
  * Groups: Shows nice tables for each group
  * Schedule: Shows the matches per day (include the matchday), it should be possible to see all entries or by a specific day. Show match time in my local time and in the match location time.

  Additional Requirements:
  * No persistence, no backend, everything is in the browser side
  * The application should be mobile friendly 
  * Static html that can be deployed in github pages
  * Use a lightweight web framework that supports modern UI. 

* MVP features : 
 * Teams: Shows entries as cards (name, continent, flag icon, group, confed). It should be possible to filter by continent and confed. Search by name
 * Groups: List the groups and teams as cards
 * Schedule: Shows the matches per day (include the matchday), it should be possible to see all entries or by a specific day. Show match time in my local time and in the match location time.