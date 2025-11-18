import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, MessageSquare, Network, Sparkles, ArrowRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header Navigation */}
        <nav className="border-b border-white/10 backdrop-blur-md bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Fusion Chat
              </span>
            </div>
            <Button
              onClick={() => navigate("/app")}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              Launch App <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Real-time Chat with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Intelligent Clustering
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
              Experience a revolutionary chat interface powered by NLP-driven message clustering and interactive visualization. See conversations evolve in real-time through an intelligent, force-directed graph.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate("/app")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-base px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Supabase Version
              </Button>
              <Button
                onClick={() => navigate("/chat")}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 text-base px-8"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                In-Memory Version
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-3xl font-bold text-blue-400">Real-time</p>
                <p className="text-sm text-gray-400 mt-1">Message sync</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-400">NLP</p>
                <p className="text-sm text-gray-400 mt-1">Smart clustering</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-400">Visual</p>
                <p className="text-sm text-gray-400 mt-1">Force graph</p>
              </div>
            </div>
          </div>

          {/* Right side - Feature cards preview */}
          <div className="relative h-96 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-2xl"></div>
            <div className="relative space-y-4 w-full">
              {/* Card 1 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Live Messaging</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Instant message synchronization with real-time updates
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-start gap-4">
                  <Network className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Smart Clustering</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      AI-powered word clustering using Transformers.js
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-pink-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Interactive Graph</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Draggable D3 force-directed visualization of word relationships
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div
          id="features"
          className="max-w-7xl mx-auto px-6 py-20 space-y-12"
        >
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A seamless integration of messaging, NLP, and visualization
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold mb-6 text-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Send Messages</h3>
              <p className="text-gray-400">
                Type messages in the chat panel. Your messages are instantly saved to Supabase and broadcast to all users in real-time.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold mb-6 text-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Clustering</h3>
              <p className="text-gray-400">
                Our NLP pipeline tokenizes, embeds, and clusters words using k-means. Related words form clusters in the visualization.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold mb-6 text-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Explore Graph</h3>
              <p className="text-gray-400">
                Click nodes in the force-directed graph to highlight all messages containing that word. Drag to explore relationships.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Built With Modern Tech</h2>
            <p className="text-xl text-gray-400">
              Cutting-edge libraries for real-time communication and visualization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "React", desc: "UI Framework" },
              { name: "Vite", desc: "Build Tool" },
              { name: "Tailwind CSS", desc: "Styling" },
              { name: "TypeScript", desc: "Type Safety" },
              { name: "Supabase", desc: "Real-time DB" },
              { name: "Transformers.js", desc: "NLP Embeddings" },
              { name: "D3.js", desc: "Visualization" },
              { name: "TanStack Query", desc: "Data Fetching" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 text-center hover:bg-white/10 transition-colors"
              >
                <p className="font-semibold text-lg">{tech.name}</p>
                <p className="text-sm text-gray-400 mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Experience It?</h2>
            <p className="text-xl text-gray-300">
              Start chatting now and watch as your messages are intelligently organized and visualized in real-time.
            </p>
            <Button
              onClick={() => navigate("/app")}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-base px-8"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Launch Fusion Chat Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
