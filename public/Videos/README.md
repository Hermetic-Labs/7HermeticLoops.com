# Hero Carousel Videos

Place video files here for the Marketplace hero carousel.

## Expected Files

- `Overview.mp4` - Main overview/intro video for the carousel

## Supported Formats

- `.mp4` (recommended)
- `.webm`
- `.mov`

## URL Pattern

Videos placed here will be available at:
- **Dev mode**: `http://localhost:5174/Videos/{filename}`
- **Production**: `https://hermetic-labs.github.io/hermetic-labs-exchange/Videos/{filename}`

## Configuration

The carousel is configured in:
`Final Production/frontend/src/pages/Marketplace.tsx`

Look for the `heroVideos` array to add/modify carousel items.
