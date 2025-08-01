# Lemora Wallet Tracker

This document provides detailed information on the structure and functionality of the Lemora Wallet Tracker.

---

## Table of Contents

- [Navigation System](#navigation-system)
- [WebSocket Backend](#websocket-backend)
- [Transaction Filters](#transaction-filters)
- [Side Panel](#side-panel)
- [Red Cube](#red-cube)
- [Backend Implementation](#backend-implementation)

---

## Navigation System

Handles navigation logic and component rendering.

### Files
- `src/navigation/navigation.ts`
- `src/navigation/handlers.ts`

## WebSocket Backend

Manages real-time communication with Solana API.

### Files
- `src/websocket/connection.ts`
- `src/websocket/handlers.ts`

## Transaction Filters

Processes transaction data and applies filters.

### Files
- `src/filters/transaction.ts`
- `src/filters/rules.ts`

## Side Panel

Creates and manages the UI side panel.

### Files
- `src/ui/sidepanel/sidepanel.ts`
- `src/ui/sidepanel/sidepanel.css`

## Red Cube

Implements 3D graphics for UI enhancement.

### Files
- `src/ui/three-cube/cube.ts`

## Backend Implementation

Details about backend logic and processing.

### Files
- `src/backend/api.ts`
- `src/backend/security.ts`

---

