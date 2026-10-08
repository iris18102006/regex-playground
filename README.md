# Regex playground

Type a pattern, see matches highlight live. Flags, capture groups, named groups, and clear error messages.

Built with TypeScript + Vite, no frameworks.

## Run it

    npm install
    npm run dev

## How the highlighting works

A transparent `<div>` sits under a transparent-background `<textarea>` with identical font metrics.
Matches are wrapped in `<mark>` in the div, so the highlights show through behind your typing.
