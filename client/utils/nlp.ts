import { pipeline } from "@xenova/transformers";

export interface ClusterNode {
  id: string;
  label: string;
  clusterId: number;
  firstMessageId: string;
  allMessageIds: string[];
  embedding: number[];
}

export interface ClusterEdge {
  source: string;
  target: string;
  weight: number;
}

export interface ClusterGraph {
  nodes: ClusterNode[];
  edges: ClusterEdge[];
}

interface Message {
  id: string;
  text: string;
}

interface TokenizedWord {
  word: string;
  messageIds: string[];
  firstMessageId: string;
  embedding?: number[];
}

// Initialize embedder lazily
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

function tokenize(text: string): string[] {
  // Simple tokenization: split by whitespace and punctuation
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2); // Filter short words
}

async function embed(texts: string[]): Promise<number[][]> {
  const embedderFn = await getEmbedder();
  const result = await embedderFn(texts, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(result.data) as unknown as number[][];
}

function kmeans(
  data: number[][],
  k: number,
  maxIterations: number = 100
): { clusters: number[]; centroids: number[][] } {
  if (data.length === 0) {
    return { clusters: [], centroids: [] };
  }

  const n = data.length;
  const d = data[0].length;

  // Initialize centroids randomly from data points
  const centroids: number[][] = [];
  const indices = new Set<number>();
  while (centroids.length < k && centroids.length < n) {
    const idx = Math.floor(Math.random() * n);
    if (!indices.has(idx)) {
      indices.add(idx);
      centroids.push([...data[idx]]);
    }
  }

  let clusters = new Array(n).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let nearestCentroid = 0;

      for (let j = 0; j < centroids.length; j++) {
        const dist = euclideanDistance(data[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          nearestCentroid = j;
        }
      }

      clusters[i] = nearestCentroid;
    }

    // Update centroids
    const newCentroids: number[][] = [];
    for (let j = 0; j < centroids.length; j++) {
      const points = data.filter((_, i) => clusters[i] === j);
      if (points.length > 0) {
        const centroid = new Array(d).fill(0);
        for (let i = 0; i < d; i++) {
          centroid[i] = points.reduce((sum, p) => sum + p[i], 0) / points.length;
        }
        newCentroids.push(centroid);
      } else {
        newCentroids.push([...centroids[j]]);
      }
    }

    // Check convergence
    let converged = true;
    for (let j = 0; j < centroids.length; j++) {
      if (euclideanDistance(centroids[j], newCentroids[j]) > 1e-6) {
        converged = false;
        break;
      }
    }

    for (let j = 0; j < centroids.length; j++) {
      centroids[j] = newCentroids[j];
    }

    if (converged) break;
  }

  return { clusters, centroids };
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return normA && normB ? dotProduct / (normA * normB) : 0;
}

export async function computeClusterGraph(
  messages: Message[],
  k: number = 3
): Promise<ClusterGraph> {
  if (messages.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Step 1: Tokenize all messages
  const tokenizedMap = new Map<string, TokenizedWord>();

  for (const message of messages) {
    const words = tokenize(message.text);
    for (const word of words) {
      if (!tokenizedMap.has(word)) {
        tokenizedMap.set(word, {
          word,
          messageIds: [],
          firstMessageId: message.id,
        });
      }
      const tokenData = tokenizedMap.get(word)!;
      if (!tokenData.messageIds.includes(message.id)) {
        tokenData.messageIds.push(message.id);
      }
    }
  }

  if (tokenizedMap.size === 0) {
    return { nodes: [], edges: [] };
  }

  // Step 2: Embed words
  const words = Array.from(tokenizedMap.values());
  const wordTexts = words.map((w) => w.word);

  let embeddings: number[][] = [];
  try {
    embeddings = await embed(wordTexts);
  } catch (error) {
    console.error("Error embedding words:", error);
    // Fallback: use random embeddings
    embeddings = words.map(() =>
      Array.from({ length: 384 }, () => Math.random() - 0.5)
    );
  }

  // Step 3: K-means clustering
  const clusterCount = Math.min(k, words.length);
  const { clusters, centroids } = kmeans(embeddings, clusterCount);

  // Step 4: Build nodes
  const nodes: ClusterNode[] = words.map((word, idx) => ({
    id: `word-${idx}`,
    label: word.word,
    clusterId: clusters[idx],
    firstMessageId: word.firstMessageId,
    allMessageIds: word.messageIds,
    embedding: embeddings[idx],
  }));

  // Step 5: Build edges based on similarity
  const edges: ClusterEdge[] = [];
  const similarityThreshold = 0.5;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].clusterId === nodes[j].clusterId) {
        const similarity = cosineSimilarity(
          nodes[i].embedding,
          nodes[j].embedding
        );
        if (similarity > similarityThreshold) {
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight: similarity,
          });
        }
      }
    }
  }

  return { nodes, edges };
}
