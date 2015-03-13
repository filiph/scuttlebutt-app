# Introduction #

The Scuttlebutt application tracks coverage of a certain topic in a customizable list of RSS feeds.  Tasks are run periodically to fetch articles from the feeds and searches for the user defined topics of interests.

To start using the app, add some entries for sources that you want to monitor to the sources page.

You will need to enter:
  1. A name for the source
  1. The url to the RSS feed
  1. The monthly visitor (readership) stat for ordering articles

Then add some topics you would like to track in the Topics page. (See screenshots for more details) The application will periodically fetch articles from the sources you provided and search for the topics you indicated an interest in.

You can manually force a fetch with the following url:

http://application-id.appspot.com/task/dispatch

and then after the fetch is done, use the url below to compute additional stats:

http://application-id.appspot.com/task/compute_stats

The frequency the tasks run in can be configured in the [cron.yaml](http://code.google.com/p/scuttlebutt-app/source/browse/scuttlebutt/cron.yaml).  If you deploy the project as is, the default is to run the fetch every hour.

Also, the app caches some results for faster access so it may take several minutes for the articles/stats to be up to date.

# Getting Started for Developers #

[Getting Started Guide](http://code.google.com/p/scuttlebutt-app/wiki/Getting_Started_Guide?ts=1332983987&updated=Getting_Started_Guide)

# API Reference #
[API Reference](http://code.google.com/p/scuttlebutt-app/wiki/API_Reference?ts=1332983883&updated=API_Reference)

# Screen Shots #
## Topics Page ##
![http://wiki.scuttlebutt-app.googlecode.com/git/screenshots/topics.png](http://wiki.scuttlebutt-app.googlecode.com/git/screenshots/topics.png)

## Sources Page ##
![http://wiki.scuttlebutt-app.googlecode.com/git/screenshots/sources.png](http://wiki.scuttlebutt-app.googlecode.com/git/screenshots/sources.png)

## Topic Trends Page ##

![http://wiki.scuttlebutt-app.googlecode.com/git/screenshots/topic_trend.png](http://wiki.scuttlebutt-app.googlecode.com/git/screenshots/topic_trend.png)