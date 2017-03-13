# Segment

A Segment analytics library using the HTTP api directly. The reason for this library is to delegate the responsibility of distributing data across integrations to Segment itself after having countless issues with data inconsistencies, because the the official Segment way is to let the browser itself take care of all the integrations. That of course creates problems with ad-blockers.

## Usage

### Client initialization

```
const Segment = require('segment');

const additionContext = {
  app: 'My Supreme Application'
};

const btoa = window.btoa // window.btoa is the default if you do not provide this argument

var segment = Segment.getClient(YOUR_SEGMENT_WRITE_KEY, additionalContext, btoa);
```
### #identify

```
const userId = 'someId';

const traits = {
  god: true
};

segment.identify(userId, traits);
```

### #track

```
const userId = 'someId';
const event = 'Clicked a CTA'

const properties = {
  ctaId: 'foo'
};

segment.track(userId, event, properties);
```

### #anonymousTrack

```
const anonymousId = '123abc';
const event = 'Clicked a CTA'

const properties = {
  ctaId: 'foo'
};

segment.anonymousTrack(anonymousId, event, properties);
```

### #page

```
const userId = 'someId';
const name = 'Index Page'

const properties = {
  referrer: 'www.google.com'
};

segment.page(userId, name, properties);
```

### #anonymousPage

```
const anonymousId = '123abc';
const name = 'Index Page'

const properties = {
  referrer: 'www.google.com'
};

segment.anonymousPage(anonymousId, name, properties);
```

