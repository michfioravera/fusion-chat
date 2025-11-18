/**
 * Pure JS TF-IDF + K-means clustering for lightweight in-memory NLP
 */

export interface Message {
  id: string;
  user: string;
  text: string;
  createdAt: number;
}

export interface ClusterNode {
  id: string;
  label: string;
  cluster: number;
  messageIds: string[];
  frequency: number;
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

// Tokenize and clean text
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !isStopword(token));
}

// Common English stopwords
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "can", "this", "that",
  "these", "those", "i", "you", "he", "she", "it", "we", "they", "what",
  "which", "who", "when", "where", "why", "how", "all", "each", "every",
  "both", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "as",
  "just", "if", "into", "through", "during", "before", "after", "above",
  "below", "up", "down", "out", "off", "over", "under", "again", "further",
  "then", "once", "here", "there", "about", "me", "my", "him", "her",
  "his", "them", "their"
]);

function isStopword(word: string): boolean {
  return STOPWORDS.has(word.toLowerCase());
}

// Calculate TF-IDF scores
interface TermFrequency {
  [term: string]: number;
}

function calculateTF(tokens: string[]): TermFrequency {
  const tf: TermFrequency = {};
  const totalTokens = tokens.length;

  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  for (const term in tf) {
    tf[term] = tf[term] / totalTokens;
  }

  return tf;
}

interface DocumentFrequency {
  [term: string]: number;
}

function calculateIDF(allTokens: string[][]): DocumentFrequency {
  const idf: DocumentFrequency = {};
  const totalDocs = allTokens.length;
  const uniqueTerms = new Set<string>();

  // Count document frequency
  const docFreq: DocumentFrequency = {};
  for (const tokens of allTokens) {
    const uniqueInDoc = new Set(tokens);
    for (const term of uniqueInDoc) {
      docFreq[term] = (docFreq[term] || 0) + 1;
    }
  }

  // Calculate IDF
  for (const term in docFreq) {
    idf[term] = Math.log(totalDocs / docFreq[term]);
  }

  return idf;
}

// Simple k-means clustering
function kmeans(
  vectors: { [key: string]: number }[],
  k: number,
  maxIterations: number = 100
): {
  clusters: number[];
  centroids: { [key: string]: number }[];
} {
  if (vectors.length === 0) {
    return { clusters: [], centroids: [] };
  }

  k = Math.min(k, vectors.length);

  // Initialize centroids randomly
  const centroids: { [key: string]: number }[] = [];
  const indices = new Set<number>();

  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * vectors.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      centroids.push({ ...vectors[idx] });
    }
  }

  let clusters = new Array(vectors.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    for (let i = 0; i < vectors.length; i++) {
      let minDist = Infinity;
      let nearestCluster = 0;

      for (let j = 0; j < centroids.length; j++) {
        const dist = euclideanDistance(vectors[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = j;
        }
      }

      clusters[i] = nearestCluster;
    }

    // Update centroids
    const newCentroids: { [key: string]: number }[] = [];
    for (let j = 0; j < centroids.length; j++) {
      const pointsInCluster = vectors.filter((_, i) => clusters[i] === j);

      if (pointsInCluster.length === 0) {
        newCentroids.push({ ...centroids[j] });
        continue;
      }

      const newCentroid: { [key: string]: number } = {};
      const allKeys = new Set<string>();
      pointsInCluster.forEach((p) => Object.keys(p).forEach((k) => allKeys.add(k)));

      for (const key of allKeys) {
        newCentroid[key] =
          pointsInCluster.reduce((sum, p) => sum + (p[key] || 0), 0) /
          pointsInCluster.length;
      }

      newCentroids.push(newCentroid);
    }

    // Check convergence
    let converged = true;
    for (let j = 0; j < centroids.length; j++) {
      if (euclideanDistance(centroids[j], newCentroids[j]) > 0.001) {
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

function euclideanDistance(
  a: { [key: string]: number },
  b: { [key: string]: number }
): number {
  let sum = 0;
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const diff = (a[key] || 0) - (b[key] || 0);
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

function cosineSimilarity(
  a: { [key: string]: number },
  b: { [key: string]: number }
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const aVal = a[key] || 0;
    const bVal = b[key] || 0;
    dotProduct += aVal * bVal;
    normA += aVal * aVal;
    normB += bVal * bVal;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  return normA && normB ? dotProduct / (normA * normB) : 0;
}

// Main clustering function
export function computeClusterGraph(
  messages: Message[],
  k: number = 3
): ClusterGraph {
  if (messages.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Extract all tokens and their document associations
  const termToMessages: { [term: string]: string[] } = {};
  const allTokensList: string[][] = [];

  for (const message of messages) {
    const tokens = tokenize(message.text);
    allTokensList.push(tokens);

    for (const token of tokens) {
      if (!termToMessages[token]) {
        termToMessages[token] = [];
      }
      if (!termToMessages[token].includes(message.id)) {
        termToMessages[token].push(message.id);
      }
    }
  }

  if (Object.keys(termToMessages).length === 0) {
    return { nodes: [], edges: [] };
  }

  // Get all unique terms
  const terms = Object.keys(termToMessages);

  // Calculate TF-IDF for each document using n-grams
  const idf = calculateIDF(allNgramsList);
  const tfidfVectors: { [key: string]: number }[] = [];

  for (const ngrams of allNgramsList) {
    const tf = calculateTF(ngrams);
    const tfidfVector: { [key: string]: number } = {};

    for (const term in tf) {
      tfidfVector[term] = tf[term] * (idf[term] || 0);
    }

    tfidfVectors.push(tfidfVector);
  }

  // Create term vectors for clustering
  const termVectors: { [key: string]: number }[] = [];
  for (const term of terms) {
    const termVector: { [key: string]: number } = {};
    const frequency = termToMessages[term].length;

    // Create a feature vector based on term frequency in documents
    for (let i = 0; i < tfidfVectors.length; i++) {
      if (tfidfVectors[i][term]) {
        termVector[`doc_${i}`] = tfidfVectors[i][term];
      }
    }

    termVectors.push(termVector);
  }

  // Cluster terms
  const { clusters } = kmeans(termVectors, Math.min(k, terms.length));

  // Build nodes
  const nodes: ClusterNode[] = terms.map((term, idx) => ({
    id: `term-${idx}`,
    label: term,
    cluster: clusters[idx],
    messageIds: termToMessages[term],
    frequency: termToMessages[term].length,
  }));

  // Sort by frequency and limit nodes for performance
  const maxNodes = 15;
  const sortedNodes = [...nodes]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, maxNodes);

  // Build edges based on co-occurrence and similarity
  const edges: ClusterEdge[] = [];
  const similarityThreshold = 0.5;

  for (let i = 0; i < sortedNodes.length; i++) {
    for (let j = i + 1; j < sortedNodes.length; j++) {
      const nodeA = sortedNodes[i];
      const nodeB = sortedNodes[j];

      // Co-occurrence: terms that appear in same messages
      const commonMessages = nodeA.messageIds.filter((id) =>
        nodeB.messageIds.includes(id)
      );
      const cooccurrence = commonMessages.length / Math.max(nodeA.messageIds.length, nodeB.messageIds.length);

      // Similarity: if same cluster or high co-occurrence
      if (nodeA.cluster === nodeB.cluster || cooccurrence > 0.2) {
        edges.push({
          source: nodeA.id,
          target: nodeB.id,
          weight: Math.max(cooccurrence, 0.3),
        });
      }
    }
  }

  return { nodes: sortedNodes, edges };
}
