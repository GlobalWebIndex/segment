# Segment

[![CircleCI](https://circleci.com/gh/GlobalWebIndex/segment/tree/master.svg?style=svg)](https://circleci.com/gh/GlobalWebIndex/segment/tree/master)

This is an unofficial alternative to [analytics.js](https://segment.com/docs/sources/website/analytics.js/) by [segment.io](https://segment.io).
Unlike original implementation this library speaks with Segment's API directly and delegates responsibility of data distribution to back-end (as official Ruby, Java, Clojure, Python and many others do).
This helps you to prevent many issues with data inconsistency between various back-ends and optimize number of HTTP payloads required for tracks.
This library also comes with few other improvements over official one namely it uses **batch api** to prevent issues with [rate limits](https://segment.com/docs/sources/server/http/#rate-limits),
prevents tracks without `userId` by using internal queue, has **Promise** API to make easy to reason about async actions and **comes with test mocks** you can use in your test suit.

## What if I actually want to track event before calling identify?

No problem with that. Just use `anonymousTrack` or `anonymousPage`.

## Demo

![demo](http://i.imgur.com/EGNqJLS.gif)

## Usage

At first install this using npm:

```
$ npm install gwi-segment --save
```

### The Most Simple Use-Case

In most cases you want to just initialize library and store instance to global singleton object like this:

```javascript
const Segment = require('gwi-segment');

window.segment = Segment.getClient('YOUR_SEGMENT_WRITE_KEY');
```

in case you need more instances or fancier implementation of static object you're free to do it as you wish!

## Api Reference

This is all you have available for production usage:

### Static Initialization

User static `getClient()` function to initialize instance of client. This is api of that function:

- `writeKey` [string] - your segment.io write key. **required**
- `options` [object] - custom settings. **optional**
  - `context` [object] - custom meta to be added to segment's context record.
  - `timeout` [number] - bulk "debounce" timeout in ms. default: 100; use `-1` for instant (sync) requests.

Calling `getClient()` returns instance of api client. This object implements this public interface:

### #identify

Used for identifying user. Id of user is than used in all `track` and `page` calls.

- `userId` [string] - identification of user **required**
- `traits` [object] - additional user information **optional**

**returns promise.**

#### Example

```javascript
const userId = 'someId';

const traits = {
  god: true
};

segment.identify(userId, traits);
```

### #track

Main method for tracking user's action in your application.

- `event` [string] - name/id of event **required**
- `properties` - additional information to event **optional**

**returns promise.**

#### Example

```javascript
const event = 'Clicked a CTA'

const properties = {
  ctaId: 'foo'
};

segment.track(event, properties);
```

### #anonymousTrack

Same as track but doesn't require `identify` call (to get `userId` to track).

- `anonymousId` [string] - value that will be send as user id just for this track
- `event` [string] - name/id of event **required**
- `properties` - additional information to event **optional**

**returns promise.**

#### Example

```javascript
const anonymousId = '123abc';
const event = 'Clicked a CTA'

const properties = {
  ctaId: 'foo'
};

segment.anonymousTrack(anonymousId, event, properties);
```

### #page

Used for tracking page event.

- `name` [string] - name/id of page displayed **required**
- `properties` [object] - addition information **optional**

**returns promise.**

#### Example

```javascript
const name = 'Index Page'

const properties = {
  referrer: 'www.google.com'
};

segment.page(name, properties);
```

### #anonymousPage

Same as `page` but doesn't require `identify` call (to get `userId` for page event).

- `anonymousId` [string] - value that will be send as user id just for this track
- `name` [string] - name/id of page displayed **required**
- `properties` [object] - addition information **optional**

**returns promise.**

```javascript
const anonymousId = '123abc';
const name = 'Index Page'

const properties = {
  referrer: 'www.google.com'
};

segment.anonymousPage(anonymousId, name, properties);
```

### #force

Send all equeued events in batch request immediately. This is usually useful before calling things like `location.reload();` or `location.href =`.

*no arguments*

**returns `undefined` (void).**

## How Queue and Waiting For UserId Works

No `#track` nor `#page` call is proceed before `#identify` is called. This is to prevent events with missing `userId` to go through the system.
All events happened before `#identify` are added to queue and are waiting for userId. Once `#identify` is called `userId` from this call is used
for all waiting events which are waiting. Events are then tracked in order they were added to queue.

## How Batching Works

By default there is `100`ms timeout for collecting all tracks into single [batch](https://segment.com/docs/sources/server/http/#batch) request. This means events are not sent immediately
but are collected into one single request. This helps you to overcome issue with [rate limits](https://segment.com/docs/sources/server/http/#rate-limits) and optimize requests from app or website.
You can change default timeout using `options.timeout` or disable it completely by passing `-1` as timeout value.

## Test Mocking

Similarly to main client you can initialize test mock instead. This is done using `getTestMockClient()` static function and returns instance implementing default API.
However this client doesn't really speaks to API but instead pushes events into internal stack. Also this client doesn't perform any merging to batch API
but rather keeps all events isolated to make it easier to use in test suit. Public api still uses promises as production one but in fact works synchronously to make your tests simpler and faster.
It also contains extra `inspect` name-space for checking state of tracks.

### #inspect.allEvents

Returns array of all events tracked (including identify and page).

*no arguments*

### #inspect.lastEvent

Returns last event tracked (including identify and page).

*no arguments*

###  #inspect.clearEvents

Clears state of test mock.

*no arguments*

## Support

This package supports Node 0.12 and higher.

## Licence

[ISC](https://en.wikipedia.org/wiki/ISC_license)
