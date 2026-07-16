I want to improve how errors are handled from my api services.

This frontend uses axios in various service classes to call off to my backend api and receive data.

It is possible for this backend api to return various error codes. I want to handle

403 - redirect to our forbidden page
500 - redirect to something went wrong page

Explore the best way to globally implement this and clean up my service calls.

Does axios have a global error handler that could help here?

