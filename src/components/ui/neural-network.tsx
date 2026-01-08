import { useEffect, useRef, useCallback } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseX: number;
  baseY: number;
}

interface NeuralNetworkProps {
  className?: string;
}

export const NeuralNetwork = ({ className = "" }: NeuralNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, isInside: false });
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>();

  const initNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];
    const nodeCount = Math.floor((width * height) / 4000); // Increased density
    
    for (let i = 0; i < Math.min(nodeCount, 120); i++) { // More nodes
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1.5,
      });
    }
    return nodes;
  }, []);

  const drawNetwork = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const nodes = nodesRef.current;
    const mouse = mouseRef.current;
    
    // Clear with Deep Slate Blue background
    ctx.fillStyle = "#243447";
    ctx.fillRect(0, 0, width, height);
    
    // Connection distance
    const maxDistance = 120;
    const mouseInfluence = 150;
    
    // Draw connections with Sage Grey
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(159, 174, 161, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Update and draw nodes
    for (const node of nodes) {
      // Subtle drift motion
      node.x += node.vx;
      node.y += node.vy;
      
      // Boundary bounce with soft return
      const margin = 20;
      if (node.x < margin || node.x > width - margin) node.vx *= -1;
      if (node.y < margin || node.y > height - margin) node.vy *= -1;
      
      // Gentle return to base position
      node.x += (node.baseX - node.x) * 0.001;
      node.y += (node.baseY - node.y) * 0.001;
      
      // Mouse interaction - subtle repulsion
      if (mouse.isInside) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseInfluence && distance > 0) {
          const force = (mouseInfluence - distance) / mouseInfluence;
          const angle = Math.atan2(dy, dx);
          node.x += Math.cos(angle) * force * 2;
          node.y += Math.sin(angle) * force * 2;
        }
      }
      
      // Draw node with enhanced glow
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, node.radius * 5
      );
      gradient.addColorStop(0, "rgba(198, 167, 94, 1)");
      gradient.addColorStop(0.3, "rgba(198, 167, 94, 0.5)");
      gradient.addColorStop(0.6, "rgba(198, 167, 94, 0.15)");
      gradient.addColorStop(1, "rgba(198, 167, 94, 0)");
      
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(node.x, node.y, node.radius * 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Core node
      ctx.beginPath();
      ctx.fillStyle = "rgba(216, 210, 198, 0.9)";
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      nodesRef.current = initNodes(rect.width, rect.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isInside: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isInside = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      drawNetwork(ctx, rect.width, rect.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initNodes, drawNetwork]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
};
