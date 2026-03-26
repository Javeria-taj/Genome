"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function BrutalistEarth() {
  const svgRef = useRef<SVGSVGElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!svgRef.current || initialized.current) return;
    initialized.current = true;

    const width = 500;
    const height = 500;
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%")
      .style("position", "absolute")
      .style("bottom", "-15%")
      .style("right", "-20%")
      .style("min-width", "450px")
      .style("max-width", "800px")
      .style("transform", "rotate(-23.5deg)") // Tilt the earth
      .style("background", "transparent");

    // Clear any previous render (strict mode safety)
    svg.selectAll("*").remove();

    const projection = d3.geoOrthographic()
      .scale(230)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule();

    // 1. Water (Atmosphere/Base)
    const waterPath = svg.append("path")
      .datum({ type: "Sphere" } as any)
      .attr("d", path as any)
      .style("fill", "#090807") // Near-black inner Earth
      .style("stroke", "rgba(237, 232, 220, 0.4)") // Paper wireframe tone
      .style("stroke-width", "1.5px");

    // 2. Graticule
    const gridPath = svg.append("path")
      .datum(graticule)
      .attr("d", path as any)
      .style("fill", "none")
      .style("stroke", "rgba(237, 232, 220, 0.15)") // faint grid
      .style("stroke-width", "0.5px");

    // 3. Landmasses
    const landGroup = svg.append("g");

    // 4. Highlight pin crosshair for visual interest (over ocean/land)
    const pinG = svg.append("g")
      .style("mix-blend-mode", "screen");
      
    // DNA ring back
    pinG.append("ellipse")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("rx", 270)
      .attr("ry", 45)
      .attr("fill", "none")
      .attr("stroke", "rgba(237, 232, 220, 0.2)")
      .attr("stroke-width", "1px")
      .attr("stroke-dasharray", "8,5")
      .attr("transform", `rotate(15, ${width/2}, ${height/2})`);

    fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
      .then(res => res.json())
      .then((world: any) => {
        const land = topojson.feature(world, world.objects.land as any);

        landGroup.selectAll(".land")
          .data((land as any).features)
          .enter().append("path")
          .attr("class", "land")
          .attr("d", path as any)
          .style("fill", "none")
          .style("stroke", "rgba(237, 232, 220, 0.4)") // Continent outlines stroke-only
          .style("stroke-width", "1px")
          .style("stroke-linejoin", "round");

        // Front half of DNA ring (clips over the earth conditionally based on SVG z-index ordering)
        svg.append("ellipse")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("rx", 270)
          .attr("ry", 45)
          .attr("fill", "none")
          .attr("stroke", "rgba(237, 232, 220, 0.6)")
          .attr("stroke-width", "1.5px")
          .attr("stroke-dasharray", "8,5")
          .attr("transform", `rotate(15, ${width/2}, ${height/2})`)
          .style("clip-path", "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)"); // Roughly front half

        // The Red Pin
        svg.append("circle")
          .attr("cx", width / 2 + 30)
          .attr("cy", height / 2 - 20)
          .attr("r", 4)
          .attr("fill", "var(--accent)");
          
        svg.append("circle")
          .attr("cx", width / 2 + 30)
          .attr("cy", height / 2 - 20)
          .attr("r", 15)
          .attr("fill", "none")
          .attr("stroke", "var(--accent)")
          .attr("stroke-width", "1px")
          .style("opacity", "0.6")
          .append("animate")
          .attr("attributeName", "r")
          .attr("values", "4;24;4")
          .attr("dur", "3s")
          .attr("repeatCount", "indefinite");
          
        svg.append("circle")
          .attr("cx", width / 2 + 30)
          .attr("cy", height / 2 - 20)
          .attr("r", 15)
          .attr("fill", "none")
          .attr("stroke", "var(--accent)")
          .attr("stroke-width", "1px")
          .style("opacity", "0.6")
          .append("animate")
          .attr("attributeName", "opacity")
          .attr("values", "0.8;0;0.8")
          .attr("dur", "3s")
          .attr("repeatCount", "indefinite");

        let rotation = 0;
        const timer = d3.timer((elapsed) => {
          rotation = elapsed * 0.015;
          projection.rotate([rotation, -15]); 
          
          waterPath.attr("d", path as any);
          gridPath.attr("d", path as any);
          landGroup.selectAll(".land").attr("d", path as any);
        });

        return () => timer.stop();
      }).catch(err => console.error("Could not load topology data", err));
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
      <svg ref={svgRef} />
    </div>
  );
}
