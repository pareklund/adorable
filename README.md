# Adorable - A Lovable Clone

## Overview

Adorable is a Lovable clone written mainly in TypeScript.

## Components 

It consists of the following components:

### The UI

Created largely in Lovable and providing the following features:

* Log in, Sign up and Log out
* Creating, Listing, Selecting/Toggling and Renaming projects
* Prompting - Initial creation (from main page - also creates project) and improvements (from chat sidebar)
* Per-project chat history - Displayed in togglable left sidebar and persisted in Supabase

### The Backend Server (API Server)

Handles/executes prompts and manages project workspaces.

Claude Code SDK is used to programmatically delegate user prompts to claude code and to collect all messages.

A shared disk volume defined in Docker Compose and rsync are used to set up new project workspaces from 
scaffolding code and to sync current project workspaces to the current workspace (as run by the dev server). 
Generated code is thereby persisted on disk in directories named by the respective project id.

### The Dev Server

Running the current project code (from the current workspace directory) as managed by the backend server.

### Supabase

Supabase handles authentication and database table storage/access.

Servers access Supabase using the Supabase publishable key as well as the user's JWT token.

### Docker / Docker Compose - Deployment and Shared Disk Volume

The servers are deployed in Docker and orchestrated using Docker Compose.

A shared disk volume is used to allow for the backend server to more easily manage the current contents of the dev server.

## Considerations and Limitations





