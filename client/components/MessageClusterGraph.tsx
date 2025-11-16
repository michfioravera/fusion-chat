import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ClusterGraph, ClusterNode, ClusterEdge } from "@/utils/nlp";
import { cn } from "@/lib/utils";

interface MessageClusterGraphProps {
  graphData: ClusterGraph | null;
  onNodeClick?: (node: {
    word: string;
    firstMessageId: string;
    allMessageIds: string[];
  }) => void;
}

const colors = [
  "#3b82f6", // blue
  "#ec4899", // pink
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ef4444", // red
];

export const MessageClusterGraph: React.FC<MessageClusterGraphProps> = ({
  graphData,
  onNodeClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !graphData) {
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Create a copy of nodes and edges for D3
    const nodes: (ClusterNode & { x?: number; y?: number; vx?: number; vy?: number })[] = graphData.nodes.map((d) => ({ ...d }));
    const links = graphData.edges.map((d) => ({
      source: d.source,
      target: d.target,
      weight: d.weight,
    }));

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance(60)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));

    // Create groups for links
    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    // Draw links
    const link = linkGroup
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#ccc")
      .attr("stroke-width", (d: any) => 1 + (d.weight || 0) * 2)
      .attr("stroke-opacity", 0.5);

    // Draw nodes
    const node = nodeGroup
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: ClusterNode) => (hoveredNode === d.id ? 20 : 15))
      .attr("fill", (d: ClusterNode) => colors[d.clusterId % colors.length])
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("mouseenter", function (event: MouseEvent, d: ClusterNode) {
        setHoveredNode(d.id);
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 20)
          .attr("stroke-width", 3);

        // Show tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", (d as any).x || 0)
          .attr("y", (d as any).y || 0 - 35)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .attr("font-weight", "bold")
          .attr("pointer-events", "none")
          .text(d.label);
      })
      .on("mouseleave", function (event: MouseEvent, d: ClusterNode) {
        setHoveredNode(null);
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 15)
          .attr("stroke-width", 2);

        svg.selectAll(".tooltip").remove();
      })
      .on("click", (event: MouseEvent, d: ClusterNode) => {
        event.stopPropagation();
        onNodeClick?.({
          word: d.label,
          firstMessageId: d.firstMessageId,
          allMessageIds: d.allMessageIds,
        });
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
    const labels = nodeGroup
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#fff")
      .attr("pointer-events", "none")
      .text((d: ClusterNode) => {
        const label = d.label;
        return label.length > 12 ? label.substring(0, 10) + "..." : label;
      });

    // Update positions on each tick
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
  }, [graphData, hoveredNode, onNodeClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden"
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
};
