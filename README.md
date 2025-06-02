# LearnQuest - Gamified Learning Platform with 15 AI Tutors

LearnQuest is an innovative educational platform that combines gamification with AI-powered tutoring to create an engaging and personalized learning experience.

## Features

- 15 specialized AI tutors powered by Nova AI
- Interactive chat interface with real-time responses
- Gamified learning experience with points and achievements
- Personalized learning paths
- Progress tracking and analytics
- PDF content processing
- Image generation capabilities

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Nova AI configuration

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/learnquest.git
cd learnquest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
NOVA_AI_MODEL=nova-ai-v1
```

4. Start the development server:
```bash
npm run dev
```

## Configuration

### Nova AI Setup
- Configure Nova AI model in your environment
- Set the model version in your `.env` file as `NOVA_AI_MODEL`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Groq for providing the AI models
- All contributors who have helped shape this project