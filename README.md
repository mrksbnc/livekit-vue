# LiveKit Vue Demo

A modern video conferencing application built with Vue.js and LiveKit.

## Features

- 🎥 High-quality video and audio streaming
- 💻 Screen sharing capability
- 🏠 Multiple layout options (Grid, Speaker, Focus)
- 🔄 Responsive design for all device sizes
- 🚀 Built with Vue 3 Composition API
- 🎨 Beautiful UI with TailwindCSS

## Components

### Core Components

- **LiveKitRoom**: Main component that establishes a connection to LiveKit server
- **VideoConference**: Container component that displays the active layout and controls
- **ParticipantTile**: Displays a participant's video, audio, and information
- **ConnectionStateIndicator**: Shows the current connection state
- **VideoControls**: Controls for toggling audio, video, and screen sharing

### Layout Components

- **GridLayout**: Displays all participants in a responsive grid
- **SpeakerLayout**: Shows the active speaker prominently with others as thumbnails
- **FocusLayout**: Highlights one participant with others in a sidebar
- **CarouselLayout**: Shows participants in a horizontally scrolling carousel

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/livekit-vue.git

# Navigate to the project directory
cd livekit-vue

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build
```

## Usage

1. Start the application
2. Enter your LiveKit server URL (e.g., `wss://your-livekit-server.com`)
3. Enter your authentication token
4. Enter the room name
5. Click "Connect" to join the video conference
6. Use the layout buttons to switch between different views
7. Use the controls at the bottom to manage your audio/video

## LiveKit Server Setup

You'll need a LiveKit server to use this application. You can:

- Use LiveKit Cloud: [https://cloud.livekit.io](https://cloud.livekit.io)
- Self-host LiveKit: [https://docs.livekit.io/getting-started/quickstart/](https://docs.livekit.io/getting-started/quickstart/)

## Project Structure

```
src/
├── components/          # UI components
│   ├── layouts/         # Layout components
│   ├── participant/     # Participant-related components
│   └── icons/           # Icon components
├── composables/         # Vue composables for LiveKit functionality
├── context/             # Context providers
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## License

MIT

## Acknowledgements

- [LiveKit](https://livekit.io/) - The powerful WebRTC platform
- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework
