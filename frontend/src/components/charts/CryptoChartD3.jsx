import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const CryptoChartD3 = () => {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState("bar"); // "bar" sau "pie"
  const svgRef = useRef();

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
    )
      .then((res) => res.json())
      .then((coins) => {
        setData(coins);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // reset svg

    const width = 1400;
    const height = 600;
    const margin = { top: 40, right: 20, bottom: 60, left: 70 };
    svg.attr("width", width).attr("height", height);

    if (chartType === "bar") {
      // BAR CHART
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.current_price)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      // X Axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

      // Y Axis
      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      // Bars
      svg
        .selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.name))
        .attr("y", (d) => y(d.current_price))
        .attr("width", x.bandwidth())
        .attr("height", (d) => y(0) - y(d.current_price))
        .attr("fill", "#8884d8")
        .append("title")
        .text((d) => `${d.name}: $${d.current_price.toLocaleString()}`);
      

    } else if (chartType === "pie") {
      // PIE CHART - Market Cap

      const radius = Math.min(width, height) / 2 - 40;
      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const pie = d3
        .pie()
        .value((d) => d.market_cap)
        .sort(null);

      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      const arcs = g.selectAll("arc").data(pie(data)).enter().append("g");

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      arcs
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i))
        .append("title")
        .text((d) => `${d.data.name}: $${d.data.market_cap.toLocaleString()}`);

      // Labels
      arcs
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#fff")
        .text((d) => d.data.symbol.toUpperCase());

    }
  }, [data, chartType]);

  return (
    <div className="chart-card">
      <h2>{chartType === "bar" ? "Top 10 Crypto Prices (USD)" : "Top 10 Crypto Market Cap Distribution"}</h2>
        <button
            className={`toggle-btn ${chartType === "bar" ? "active" : ""}`}
            onClick={() => setChartType(chartType === "bar" ? "pie" : "bar")}
        >
            Switch to {chartType === "bar" ? "Pie Chart" : "Bar Chart"}
        </button>
        <svg ref={svgRef}></svg>
    </div>
  );
};

export default CryptoChartD3;
