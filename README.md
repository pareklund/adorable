# Adorable - A Lovable Clone

## Overview

Adorable is a Lovable clone written mainly in TypeScript.

## How to Run

Just issue:

```
docker compose build
docker compose up
```

NOTE: Make sure you have an .env file in the backend/adorable-backend folder, containing at least the following
environment variable:

```
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ANTHROPIC_API_KEY=<your-key>
```

Access the Adorable UI at http://localhost:3000.

## Components 

It consists of the following components:

### The UI

**Project location:** client/adorable-chat-connect

Created largely in Lovable and providing the following features:

* Log in, Sign up and Log out
* Creating, Listing, Selecting/Toggling and Renaming projects
* Prompting - Initial creation (from main page - also creates project) and improvements (from chat sidebar)
* Per-project chat history - Displayed in togglable left sidebar and persisted in Supabase

### The Backend Server (API Server)

**Project location:** backend/adorable-backend

Handles/executes prompts and manages project workspaces.

Claude Code SDK is used to programmatically delegate user prompts to claude code and to collect all messages.

A shared disk volume defined in Docker Compose and rsync are used to set up new project workspaces from 
scaffolding code and to sync current project workspaces to the current workspace (as run by the dev server). 
Generated code is thereby persisted on disk in directories named by the respective project id.

### The Dev Server

No code/project of its own, just running the current project code (from the current workspace directory) as managed by the 
backend server.

### Supabase

Supabase handles authentication and database table storage/access.

Servers access Supabase using the Supabase publishable key as well as the user's JWT token.

### Docker / Docker Compose - Deployment and Shared Disk Volume

The servers are deployed in Docker and orchestrated using Docker Compose.

A shared disk volume is used to allow for the backend server to more easily manage the current contents of the dev server.

## Considerations and Limitations

Here follows a list of considerations and limitations in no particular order:

### Single-User Only

The current setup is only for local, one user scenarios. In particular, the backend- and dev server assumes there is 
always just one (1) active workspace/project. Perhaps for an app like this - that creates and manages other apps and 
all its files - it might not be as easy to achieve multi-tenancy as in more classic server applications, but still.

### Claud Code Doing All The Heavy Lifting

Arguably, Adorable is a Lovable wrapper on top of Claude Code. It was basically the only feasible way of getting 
something functional up so quickly, but a real implementation would probably have:
* A comprehensive, customized and tuned system prompt
* Specific tool usage
* Selecting different LLMs depending on the case at hand
* Custom logic and workflows
* Etc.

### Docker Compose Setup

The Docker Compose setup uses a shared disk volume to, through the use of rsync in the backend server, enable syncing of 
the current workspace and be able to see changes in the dev server immediately. This couples the containers to the same 
host, which is inoptimal and somewhat limits deployment options. 

Also, the shared volume setup makes the Docker build phase a bit more involved - with the need for an init container - 
and requires the dev server to perform `npm install` during startup instead of during build time. Granted, this might be
avoidable, but given my limited recent work with Docker recently and the limited time allotted for the exercise, I 
settled for the current solution.

### Missing GitHub Integration

It would be desirable to have, like in Lovable, the user connect their apps to GitHub and be able to push the generated 
code changes there. It could possibly also have been a way to achieve more autonomy between backend- and dev servers - 
i.e. to avoid the issues described in the previous paragraph. That said, GitHub integration is probably more for the 
benefit of users being able to collaborate with AI:s on the codebase rather than being the fundamental sync mechanism. 

**NOTE:** When adding GitHub integration - connecting the project workspaces to repositories in GitHub - GitHub Webhooks
would need to be set up, in order to notify the backend server of any changes and, upon a change, pull the latest 
changes from the repository and - if it is the current workspace - rsync the changes to the current workspace, to 
have the changes be reflected automatically in the dev server.

### Deployment of Created Apps

No deployment of created apps is (yet) implemented, which is arguably a very important feature.

### UI Responsiveness

Unlike Lovable, long-running operations like prompts and workspace operations don't send back any information until 
the operations are fully completed. Therefore, it might appear (especially for prompts) that the application has hung. 
To alleviate your fears, turn to the console running `docker compose up` and you most likely see that the application
(Claude) is hard at work.


### TODO

There are definitely more considerations and limitations, but I am getting too tired to write more at the moment. 
I will continue writing tomorrow or upon request.

Also, I really want to clean up the code. I just managed to finish implementing the needed functionality in time. 
Just to state that the current code quality is NOT representative of my normal work, but rather that sometimes one 
has to make hard priorities and cut some corners (at least temporarily) to get through the gates in time.

## Screenshots

Below are some screenshots from running the app.

### Multiple Apps 

Multiple apps created and managed in parallel (+ sidebar with project-/app-specific chat history)

![TODO app created](doc/images/todo-app-created.png)

![Calendar app created](doc/images/calendar-app-created.png)

![Inspirational app created](doc/images/inspirational-app-created.png)

Improve an app (consecutive prompts)

![Improve app](doc/images/improve-app.png)

Rename a project 
![Rename project](doc/images/rename-project.png)

