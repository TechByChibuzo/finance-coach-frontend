import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import { categoryLabel } from '../../utils/categories';
import { formatCurrency } from '../../utils/helpers';

const INCOME = 'var(--color-chart-income)';
const SPENDING = 'var(--color-chart-spending)';
const TOP_CATEGORIES = 6;

/**
 * Builds the month's flows: money in (and, when spending ran over, savings drawn on) into
 * spending and what was saved, and spending into its biggest categories.
 */
function buildFlows(month) {
  const income = month.income;
  const spending = month.spending;
  if (income <= 0 && spending <= 0) return null;

  const categories = Object.entries(month.spendingByCategory)
    .map(([code, amount]) => ({ code, amount: Number(amount) }))
    .filter((c) => c.amount > 0);
  const top = categories.slice(0, TOP_CATEGORIES);
  const rest = categories.slice(TOP_CATEGORIES).reduce((sum, c) => sum + c.amount, 0);

  const nodes = [];
  const links = [];
  const add = (name, color, column) => nodes.push({ name, color, column }) - 1;

  const moneyIn = income > 0 ? add('Money in', INCOME, 0) : null;
  const fromSavings = spending > income ? add('From savings', INCOME, 0) : null;
  const spent = spending > 0 ? add('Spending', SPENDING, 1) : null;
  const saved = income > spending ? add('Saved', INCOME, 1) : null;

  if (moneyIn != null && spent != null) links.push({ source: moneyIn, target: spent, value: Math.min(income, spending) });
  if (moneyIn != null && saved != null) links.push({ source: moneyIn, target: saved, value: income - spending });
  if (fromSavings != null) links.push({ source: fromSavings, target: spent, value: spending - income });
  for (const c of top) links.push({ source: spent, target: add(categoryLabel(c.code), SPENDING, 2), value: c.amount });
  if (rest > 0) links.push({ source: spent, target: add('Everything else', SPENDING, 2), value: rest });

  return { nodes, links };
}

function Node({ x, y, width, height, payload }) {
  // Sources are labelled on their left, end points on their right, and the middle node above
  // itself so the label doesn't sit on the streams
  // In Recharts a node's sourceLinks are the links coming into it, targetLinks those leaving it
  const isSource = !payload.sourceLinks?.length;
  const isEnd = !payload.targetLinks?.length;
  let labelX = x + width + 10;
  let labelY = y + height / 2;
  let anchor = 'start';
  if (isSource) {
    labelX = x - 10;
    anchor = 'end';
  } else if (!isEnd) {
    labelX = x + width / 2;
    labelY = y - 12;
    anchor = 'middle';
  }
  return (
    <g>
      <rect x={x} y={y} width={width} height={Math.max(height, 2)} rx={3} fill={payload.color} />
      <text x={labelX} y={labelY} dy="0.35em" textAnchor={anchor} fontSize={13}>
        <tspan fill="var(--color-gray-900)" fontWeight={600}>{payload.name}</tspan>
        <tspan fill="var(--color-gray-500)" dx={6}>{formatCurrency(payload.value, false)}</tspan>
      </text>
    </g>
  );
}

function Link({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, payload }) {
  const color = payload.target.color;
  return (
    <path
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={color}
      strokeOpacity={0.22}
      strokeWidth={Math.max(linkWidth, 1)}
    />
  );
}

function FlowTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload?.payload ?? payload[0].payload;
  const label = item.source && item.target ? `${item.source.name} to ${item.target.name}` : item.name;
  return (
    <div className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-gray-600 tabular-nums">{formatCurrency(item.value, false)}</p>
    </div>
  );
}

/**
 * Where a month's money went, as flows from money in through spending into categories
 */
export default function CashFlowSankey({ month }) {
  const flows = buildFlows(month);
  if (!flows) return null;

  return (
    <div className="h-96" role="img" aria-label="Money in split into spending and savings, and spending into categories">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={flows}
          nodeWidth={10}
          nodePadding={20}
          linkCurvature={0.5}
          iterations={64}
          margin={{ top: 28, right: 210, bottom: 8, left: 150 }}
          node={<Node />}
          link={<Link />}
          sort={false}
        >
          <Tooltip content={<FlowTooltip />} />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
