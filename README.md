# Stock Valuation Toolkit

A Next.js and TypeScript application for exploring equity valuation assumptions, estimated values and financial model outputs.

> Portfolio project. Calculations are illustrative, depend on user inputs, and are not investment advice.

## What this demonstrates

- **Frontend engineering:** Next.js 15, React 19, TypeScript, Tailwind CSS, interactive components and valuation dashboards.
- **Financial domain modeling:** Presenting discounted cash flow, dividend discount, and multiples-based valuation approaches. Review each model's assumptions before using outputs.
- **Integration:** Market-data service code under `services/marketData` and API routes under `app/api`.
- **Data presentation:** Recharts, reusable UI components, and model-specific screens.

## Architecture

```text
Browser (React / Next.js)
  |-- app/                    Routes, page composition, API endpoints
  |-- features/dashboard/     Dashboard features
  |-- features/models/        Model-specific experiences
  |-- features/valuation/     Valuation workflows
  |-- components/             Shared presentation elements
  |-- services/marketData/    Market-data integration
  |-- lib/ and types/         Utilities and shared types
```

This describes the repository structure rather than claiming that calculations are independently audited or deployed as a production finance service.

## Run locally

**Prerequisites:** Node.js and npm. Consult `package.json` for pinned framework versions.

```bash
git clone https://github.com/phawatboom/stock-valuation.git
cd stock-valuation
npm ci
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Market-data-dependent features may require network access or configuration. See the API/service implementation for their current behavior.

For a production build:

```bash
npm run build
npm run start
```

## How to inspect the implementation

| Topic | Starting point |
| --- | --- |
| Main UI | [app/page.tsx](app/page.tsx) |
| Valuation flows | [features/valuation](features/valuation) |
| Model views | [features/models](features/models) |
| API routes | [app/api](app/api) |
| Market data | [services/marketData](services/marketData) |
| Type definitions | [types](types) |

## Model interpretation

Valuation is sensitive to growth, margin, discount-rate, terminal-value, and market-comparable assumptions. Different methods answer different questions and need not converge on one estimate. Users should perform scenario analysis, check units and financial-statement conventions, and compare estimated value with current market data before drawing conclusions.

The repository includes a [repository validation report](REPOSITORY_VALIDATION_REPORT.md) and [code-quality notes](CODE_QUALITY_IMPROVEMENTS.md). These are historical documentation, **not evidence of a currently passing automated test suite**. Independent verification and tests are still recommended before treating valuation outputs as decision-grade.

## Suggested engineering improvements

- Add deterministic unit tests for financial formulas and edge cases, particularly terminal growth approaching the discount rate, negative cash flows, missing market data, and unit conversions.
- Add integration tests for API routes with network responses mocked.
- Replace the current `next lint` script if necessary for the installed Next.js version, and run lint, type checking, and tests through CI.
- Add screenshots or a short demo and document deployment status only after verifying a working public instance.

## Technology

Next.js 15, React 19, TypeScript, Tailwind CSS 4, Recharts, Radix UI, and Yahoo Finance integration. See [package.json](package.json) for the exact dependency versions.
