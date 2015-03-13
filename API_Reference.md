# Topic #

## GET /api/topics ##

List all topics.

Example JSON:
Response Code 200 OK -> success
```
[
  {
    "name": "Android", 
    "id": 4001, 
    "countPastSevenDays": 512, 
    "countPastTwentyFourHours": 56,
    "weekOnWeekChange": 0.15913
  },
  {
    "name": "Chromebook", 
    "id": 120001, 
    "countPastSevenDays": 15, 
    "countPastTwentyFourHours": 3,
    "weekOnWeekChange": 0.33333
  }, 
  {
    "name": "Google Wallet", 
    "id": 72002, 
    "countPastSevenDays": 1, 
    "countPastTwentyFourHours": 1,
    "weekOnWeekChange": 1000000001
  },
  ...
]
```

Note the number 1000000001 in "Google Wallet" record. This (or any other number larger than 1000000000) signifies a WoW change of +Infinity. This is when there were no articles last week and there is one or more this week (=> percent change of infinity).

## POST /api/topics ##

Creates a new topic. Returns topic id.

POST data JSON (frontend --> backend):
```
{
  "name": "Google Wallet" 
}
```
Test it out with:
```
curl -X POST -d "{\"name\": \"Gmail\"}" -H 'Content-Type:application/json' http://localhost:8080/api/topics
```
Example JSON Response:
Response Code 200 OK -> success
```
{"id": 6, "countPastTwentyFourHours": null, "name": "Gmail", "weekOnWeekChange": null, "countPastSevenDays": null}
```

### Error codes ###
  * 400 - Bad syntax (malformed JSON)
  * 422 - Topic already exists or missing fields on Topic JSON

---

# Topic Stats #
## GET /api/topic\_stats/123 ##
Example JSON:
Response Code 200 OK -> success
```
[
  {
    "date" : "2011-12-25",
    "count" : 48
  },
  {
    "date" : "2011-12-24",
    "count" : 46
  }
  ...
]
```

---

# Article #

## GET /api/articles/123 ##
get latest articles of given topic with default order\_by, limit, ...

## GET /api/articles/123?from=2012-02-13&to=2012-02-19 ##
get articles from Feb 12 to Feb 19

## GET /api/articles/123?limit=100 ##
get latest 100 articles

---

# Source #

## GET /api/sources ##
List all sources.

Example JSON:
Response Code 200 OK -> success
```
[
  {
    "name": "Reuters", 
    "id": 4001,
    "url": "www.reuters.com/rss" 
    "monthlyVisitors": 100000 
  },
  {
    "name": "Tech Crunch", 
    "id": 4002, 
    "url": "www.techcrunch.com/new/feed"
    "monthlyVisitors": 1200000
  }  ...
]
```
The monthlyVisitor field could be optional.


## POST /api/sources ##

Creates a new feed. Returns json with feed id.

POST data JSON (frontend --> backend):
```
{
  "name": "new feed",
  "url": "www.reuters.com/rss" 
  "monthlyVisitors": 103000  
}
```
Note: monthlyVisitors field can be "" when specified by user. Backend will re-write to 0.

Example JSON response:
Response Code 200 OK -> success
```
{
  "name": "new feed",
  "id": 123
  "url": "www.reuters.com/rss" 
  "monthlyVisitors": 103000  
}
```
### Error codes ###
  * 400 - Bad syntax (malformed JSON)
  * 422 - Topic already exists or missing fields on Topic JSON