# Fusion Chat

A real-time chat application with intelligent NLP-driven word clustering and interactive D3.js force-directed graph visualization. Perfect for simulating multi-user conversations and exploring message patterns through dynamic graph interactions.

## Features

- **Multi-User Chat**: Create and switch between different user personas seamlessly
- **Smart Word Clustering**: Uses TF-IDF and K-means clustering to group related words
- **Interactive Graph**: D3.js force-directed visualization showing word relationships
- **Real-Time Updates**: Messages instantly update the graph visualization
- **In-Memory Storage**: All data persists in the browser session (no backend required)
- **Message Highlighting**: Click graph nodes to highlight all messages containing that word
- **Responsive Design**: Beautiful dark-themed UI that works on all screen sizes

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Visualization**: D3.js (force-directed graph)
- **Styling**: Tailwind CSS + Radix UI components
- **Build Tool**: Vite
- **NLP**: Pure JavaScript implementation
  - TF-IDF for term importance scoring
  - K-means clustering for word grouping
  - Custom tokenization and stopword filtering
- **Routing**: React Router
- **State Management**: React Context API

## How It Works

### 1. **Message Input**

Send messages as different users to build a multi-user conversation

### 2. **NLP Pipeline**

- Messages are tokenized (split into words)
- Stopwords are filtered out
- TF-IDF scores are calculated for each word
- K-means clustering groups similar words together

### 3. **Graph Visualization**

- Nodes represent words/clusters sized by frequency
- Node colors indicate cluster membership
- Edges show co-occurrence relationships
- Force simulation creates natural spacing

### 4. **Interaction**

- **Drag nodes** to explore the graph layout
- **Hover nodes** to see word frequency
- **Click nodes** to highlight all messages containing that word
- **Switch users** using the user dropdown to control different personas

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
pnpm run build:client

# Build server (if needed)
pnpm run build:server
```

## Usage

### Creating Users

1. Click **Users (n)** dropdown in the header
2. Click **+ New User** to create a new user persona
3. Start sending messages as that user

### Switching Users

1. Click **Users (n)** dropdown
2. Click any existing user to switch to them
3. All previous messages are preserved

### Interacting with the Graph

- **View word clusters**: Left side shows the force-directed graph
- **Click a node**: Highlights all messages containing that word
- **Drag nodes**: Rearrange the graph to explore relationships
- **Hover nodes**: See word frequency tooltip

### Managing Messages

- **Clear All**: Remove all messages from all users
- **Logout**: Return to home (preserves all messages in browser)
- **Switch User**: Create new users without losing history

## Project Structure

```
client/
├── components/
│   ├── InMemoryGraphVisualizer.tsx    # D3.js graph visualization
│   ├── InMemoryChatInput.tsx          # Message input component
│   ├── InMemoryChatWindow.tsx         # Message display
│   └── ui/                             # Radix UI components
├── context/
│   └── InMemoryDataProvider.tsx       # React Context for shared state
├── pages/
│   ├── Index.tsx                      # Landing page
│   ├── InMemoryChat.tsx               # Main chat page
│   └── NotFound.tsx                   # 404 page
├── utils/
│   └── nlpInMemory.ts                 # NLP pipeline (TF-IDF, K-means)
└── App.tsx                            # Main app component
```

## NLP Implementation Details

### Tokenization

- Converts text to lowercase
- Removes special characters
- Filters out stopwords (common words like "the", "a", etc.)
- Only keeps words with 3+ characters

### TF-IDF Scoring

- **TF (Term Frequency)**: How often a word appears in a message
- **IDF (Inverse Document Frequency)**: How unique a word is across all messages
- **TF-IDF**: Product of TF and IDF for importance weighting

### K-Means Clustering

- Groups words into clusters based on their TF-IDF vectors
- Default: 3 clusters (configurable)
- Uses Euclidean distance for similarity measurement

## Customization

### Change Number of Clusters

Edit `client/context/InMemoryDataProvider.tsx`:

```typescript
const graph = computeClusterGraph(messages, 3); // Change 3 to desired cluster count
```

### Adjust Graph Forces

Edit `client/components/InMemoryGraphVisualizer.tsx`:

```typescript
.force("charge", d3.forceManyBody().strength(-300))  // Repulsion strength
.force("collision", d3.forceCollide().radius(40))    // Node collision radius
```

### Modify Stopwords

Edit `client/utils/nlpInMemory.ts`:

```typescript
const stopwords = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "be",
  // Add more stopwords here
]);
```

## Deployment

### Netlify

```bash
# Build will be automatically run on deploy
# Configure in netlify.toml for production
```

The app is configured to deploy to Netlify with:

- Build command: `npm run build:client`
- Publish directory: `dist/spa`

## 🔧 Available Scripts

```bash
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run build:client     # Build client only
pnpm run build:server     # Build server only
pnpm run start            # Start production server
pnpm run test             # Run tests
pnpm run typecheck        # Check TypeScript types
pnpm run format.fix       # Format code with Prettier
```

## 📝 Notes

- **Browser Storage**: User list is stored in `localStorage` and persists across browser sessions
- **In-Memory Messages**: Chat messages are stored in memory and cleared on page refresh
- **Graph Updates**: The graph recalculates whenever a new message is added
- **Performance**: Optimized to display top 15 most frequent words to maintain performance

## Contributing

Feel free to extend this project:

- Add persistence with a database (Supabase, Firebase, etc.)
- Implement different clustering algorithms
- Add message search and filtering
- Create custom graph layouts
- Export conversation data

## License

This project is open source and available under the MIT License.

## Learning Resources

### NLP Concepts

- [TF-IDF Explained](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- [K-Means Clustering](https://en.wikipedia.org/wiki/K-means_clustering)
- [Text Preprocessing](https://en.wikipedia.org/wiki/Stemming)

### Technologies

- [D3.js Documentation](https://d3js.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

