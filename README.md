# Segment

A Segment analytics library using the HTTP api directly. The reason for this library is to delegate the responsibility of distributing data across integrations to Segment itself after having countless issues with data inconsistencies, because the official Segment way is to let the browser itself take care of all the integrations. That of course creates problems with ad-blockers.

## Usage

### Client initialization

```javascript
const Segment = require('segment');

// Optional
const additionContext = {
  app: 'My Supreme Application'
};

// Optional, window.btoa is the default if you do not provide this argument
const btoa = window.btoa

var segment = Segment.getClient(YOUR_SEGMENT_WRITE_KEY, additionalContext, btoa);
```

### #identify

```javascript
const userId = 'someId';

const traits = {
  god: true
};

segment.identify(userId, traits);
```

### #track

```javascript
const userId = 'someId';
const event = 'Clicked a CTA'

const properties = {
  ctaId: 'foo'
};

segment.track(userId, event, properties);
```

### #anonymousTrack

```javascript
const anonymousId = '123abc';
const event = 'Clicked a CTA'

const properties = {
  ctaId: 'foo'
};

segment.anonymousTrack(anonymousId, event, properties);
```

### #page

```javascript
const userId = 'someId';
const name = 'Index Page'

const properties = {
  referrer: 'www.google.com'
};

segment.page(userId, name, properties);
```

### #anonymousPage

```javascript
const anonymousId = '123abc';
const name = 'Index Page'

const properties = {
  referrer: 'www.google.com'
};

segment.anonymousPage(anonymousId, name, properties);
```

