import * as d3 from 'd3';
import dagreD3 from '../dagre/dagre-d3.min';

import sprites from './sprites';
import { operationVariableCounts } from './evaluate';

const { render: Render, graphlib } = dagreD3;

// Maps names to symbols
const names = {
  '¬': 'NOT',
  '∧': 'AND',
  '∨': 'OR',
  '→': 'IMPLY',
  '⊕': 'XOR',
  '≡': 'XNOR',
};

const svg = d3.select('#diagram');
const inner = svg.select('g');

// Create the renderer
const render = new Render();

// The graph to be rendered
let g;

render.shapes().gate = (parent, bbox, node) => {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: w * 0.05, y: -h * 0.3 },
    { x: w * 0.3, y: -h * 0.1 },
    { x: w * 0.95, y: -h / 2 },
    { x: w * 0.3, y: -h * 0.9 },
    { x: w * 0.05, y: -h * 0.7 },
  ];

  const shapeSvg = parent
    .insert('polygon', ':first-child')
    .attr('points', points.map((d) => `${d.x},${d.y}`).join(' '))
    .attr('transform', `translate(${-w / 2},${h * 0.5})`);

  parent
    .insert('svg')
    .attr('class', 'nodeImage')
    .attr('x', -w / 2)
    .attr('y', -h / 2)
    .attr('width', w)
    .attr('height', h)
    .insert('use')
    .attr('href', sprites[node.gate].url);

  return shapeSvg;
};

export const resize = () => {
  // Get graph dimensions
  const graphWidth = g.graph().width;
  const graphHeight = g.graph().height;
  // Get SVG width
  const width = parseInt(svg.style('width').replace(/px/, ''), 10);

  inner.attr(
    'transform',
    `scale(${width / graphWidth}),
    translate(0, 20)`
  );

  svg.attr('height', (graphHeight + 40) * (width / graphWidth));
};

// Draws the circuit diagram
export const drawCircuit = (exp) => {
  inner.selectAll('*').remove();

  // Create a new directed graph
  g = new graphlib.Graph().setGraph({ rankdir: 'RL', nodeSep: 20 });

  g.setNode('0', { label: 'Q' });

  const newExp = exp.slice();

  const addNode = (direction, parentNode, node) => {
    const token = newExp.pop();
    if (token in operationVariableCounts) {
      g.setNode(node, {
        shape: 'gate',
        label: '',
        width: 180,
        height: 90,
        direction,
        gate: names[token],
      });

      const count = operationVariableCounts[token];
      if (count === '1') {
        addNode(0, node, `${node}0`);
      } else if (count === '2') {
        addNode(-1, node, `${node}0`);
        addNode(1, node, `${node}1`);
      }
    } else {
      g.setNode(node, { label: token, direction });
    }

    g.setEdge(parentNode, node, { arrowhead: 'undirected' });
  };

  addNode(0, '0', '00');

  // Run the renderer. This is what draws the final graph.
  render(inner, g);

  resize(g);
};
