# Shard Guard - Telegram Mini App for Web3 Key Management

Shard Guard is a secure and intuitive Telegram Mini App for managing Ethereum private keys using Shamir Secret Sharing.

## Features

- **Ethereum Key Generation**: Create or import Ethereum private keys
- **Shamir Secret Sharing**: Split your private key into multiple shares with a configurable threshold
- **Secure Storage**: Shares are stored securely associated with your Telegram account
- **Beautiful UI**: Intuitive interface with dark/light mode support based on Telegram settings
- **Responsive Design**: Works seamlessly on both mobile and desktop

## How It Works

1. **Generate or Import**: Create a new Ethereum key or import an existing one
2. **Configure Sharing**: Select how many shares to split your key into and the threshold required for reconstruction
3. **Store Securely**: Your shares are stored securely, linked to your Telegram ID

## Technology Stack

- React with TypeScript
- TailwindCSS for styling
- Framer Motion for animations
- Telegram Mini App SDK
- ethers.js for Ethereum functionality
- secrets.js for Shamir Secret Sharing

## Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Deployment as a Telegram Mini App

1. Build the application using `npm run build`
2. Host the built application on a static hosting service (Vercel, Netlify, etc.)
3. Register your bot with BotFather and set up the Mini App
4. Configure your Mini App to point to your hosted application

## Security Considerations

- All cryptographic operations happen client-side
- No private keys are ever sent to any server
- The application uses localStorage for persistence
- For maximum security, consider using the app in Telegram's desktop client

## License

MIT

## Author

Created with ❤️ for Telegram Mini App ecosystem
