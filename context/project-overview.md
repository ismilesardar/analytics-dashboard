# Project Overview

## What

A Next.js chat application built for a frontend take-home assignment. It's a
pure frontend — no database or backend of its own — that talks directly to
the hosted API at `https://frontend-task-chatapp.onrender.com/api`. Users log
in with just a phone number and name (the API auto-registers new numbers),
then start 1:1 or group conversations and message in real time over
Socket.IO. A separate landing page showcases the feature to prospective
users.

## Goals

1. Implement every required chat flow from the assignment brief: login,
   starting a conversation, group conversations, message history, sending
   messages, real-time updates, loading/empty/error states, and smart
   auto-scroll.
2. Make the chat panel itself (message list, sending, real-time behavior)
   the most polished part — it's explicitly what the assignment says to
   prioritize.
3. Ship a bold, original landing page presenting the chat feature.
4. Deploy a working, live demo (Vercel) before the deadline.

## Core User Flow

1. User logs in with a phone number and display name (new number = instant
   registration, existing number = login).
2. User lands on the conversation list — direct and group conversations they're part of, sorted by most recent activity.
3. User searches by name/phone to start a new direct conversation, or creates
   a group with multiple participants.
4. User opens a conversation, sees the full message history (paginated,
   loads older messages on scroll-up), and sends new messages.
5. New incoming messages appear live via Socket.IO without a page refresh;
   the view auto-scrolls to the latest message unless the user has
   scrolled up to read history.

## Features

### Auth

- Phone + name login/registration (single endpoint, no separate signup)
- Session persistence (JWT bearer token) across reloads

### Conversations

- List of the current user's direct + group conversations
- Search users by name/phone to start a direct conversation
- Create a group conversation with multiple participants

### Messaging

- Full message history per conversation, sender vs. receiver visually
  distinguished, each message timestamped
- Send new messages; empty/whitespace-only messages blocked client-side
  (the API itself does not validate this)
- Real-time delivery of new messages via Socket.IO (`message:new`)
- Auto-scroll to latest message, without yanking the user's scroll position
  if they've scrolled up

### States

- Loading, empty, and error states handled throughout (conversation list,
  message list, sending)

### Landing Page

- Standalone marketing page presenting the chat feature, own design,
  responsive

## Scope

**In:** Everything listed under Features above, built directly against the
given hosted API — no custom backend, no database, no persisted server-side
state of our own.

**Out:** Read receipts, file/image attachments, message editing or deletion,
push notifications, and any dashboard/billing/workspace functionality
inherited from this repo's original unrelated template (all removed during
cleanup) — unless one of these is deliberately picked up later as the
assignment's "bonus, original touch" feature.

## Success Criteria

1. `pnpm tsc --noEmit` passes with no errors.
2. All Core User Flow steps work end-to-end against the live API in a
   browser: login, search, direct + group conversation creation, sending,
   real-time receipt in a second session, scroll-up pagination, and blocked
   empty sends.
3. Deployed to a live Vercel URL, with both the chat app and the landing
   page reachable from it.
4. README includes setup instructions and the Part 3 write-up.
