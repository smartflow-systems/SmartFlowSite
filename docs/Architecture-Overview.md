# Architecture Overview
## Context
Goal, users, key constraints.
## Components
<service> — purpose, I/O.
## Data Flow
request → gateway → service → store → response.
## External Deps
OpenAI (optional), GitHub, SFS API.
## Risks
Single points, rate limits, secrets handling.
