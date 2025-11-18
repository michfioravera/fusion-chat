import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useInMemoryData } from "@/context/InMemoryDataProvider";
import { ClusterGraph, ClusterNode } from "@/utils/nlpInMemory";

interface GraphVisualizerProps {
  onNodeClick?: (node: ClusterNode) => void;
  highlightedNodeId?: string;
}

const COLORS = [
  "#3b82f6", // blue
  "#ec4899", // pink
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#06b6d4", // cyan
];

/**
 * GraphVisualizer Component
 * - Uses D3.js force simulation to visualize word clusters
 * - Nodes represent keywords, sized by frequency
 * - Edges show co-occurrence relationships
 * - Interactive: drag nodes, hover for details, click to highlight
 * - Auto-updates when cluster graph changes
 */
export const InMemoryGraphVisualizer: React.FC<GraphVisualizerProps> = ({
  onNodeClick,
  highlightedNodeId,
}) => {
  const { clusterGraph } = useInMemoryData();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !clusterGraph) {
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Copy data for D3
    const nodes: (ClusterNode & { x?: number; y?: number; vx?: number; vy?: number })[] =
      clusterGraph.nodes.map((d) => ({ ...d }));
    const links = clusterGraph.edges.map((d) => ({
      source: d.source,
      target: d.target,
      weight: d.weight,
    }));

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance((d: any) => 60 * (1 - d.weight))
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Draw links
    const link = svg
      .append("g")
      .attr("stroke", "#ccc")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", (d: any) => 1 + (d.weight || 0) * 3);

    // Draw nodes
    const node = svg
      .append("g")
      .attr("fill", "white")
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: ClusterNode) => 8 + Math.sqrt(d.frequency) * 4)
      .attr("fill", (d: ClusterNode) => COLORS[d.cluster % COLORS.length])
      .attr("cursor", "pointer")
      .attr("opacity", (d: ClusterNode) => {
        if (!highlightedNodeId) return 1;
        return d.id === highlightedNodeId ? 1 : 0.3;
      })
      .on("mouseenter", function (event: MouseEvent, d: ClusterNode) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8 + Math.sqrt(d.frequency) * 4 + 5)
          .attr("stroke-width", 3);

        // Show tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", (d as any).x || 0)
          .attr("y", (d as any).y || 0 - 35)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .attr("fill", "#333")
          .attr("pointer-events", "none")
          .text(`${d.label} (${d.frequency})`);
      })
      .on("mouseleave", function (event: MouseEvent, d: ClusterNode) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8 + Math.sqrt(d.frequency) * 4)
          .attr("stroke-width", 2);

        svg.selectAll(".tooltip").remove();
      })
      .on("click", (event: MouseEvent, d: ClusterNode) => {
        event.stopPropagation();
        onNodeClick?.(d);
      })
      .call(
        d3
          .drag<SVGCircleElement, ClusterNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      );

    // Add labels
    const labels = svg
      .append("g")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("pointer-events", "none")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d: ClusterNode) => {
        const label = d.label;
        return label.length > 15 ? label.substring(0, 13) + "." : label;
      });

    // Update on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x || 0)
        .attr("y1", (d: any) => d.source.y || 0)
        .attr("x2", (d: any) => d.target.x || 0)
        .attr("y2", (d: any) => d.target.y || 0);

      node.attr("cx", (d: any) => d.x || 0).attr("cy", (d: any) => d.y || 0);

      labels.attr("x", (d: any) => d.x || 0).attr("y", (d: any) => d.y || 0);
    });

    return () => {
      simulation.stop();
    };
  }, [clusterGraph, highlightedNodeId, onNodeClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden"
    >
      <svg ref={svgRef} className="w-full h-full" style={{ display: "block" }} />

      {clusterGraph.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
          <div className="text-gray-500">
            <p className="font-medium">Graph is empty</p>
            <p className="text-sm mt-1">Send a message to generate clusters</p>
          </div>
        </div>
      )}
    </div>
  );
};
