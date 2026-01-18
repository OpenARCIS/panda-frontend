# API Schema

This document details the API endpoints available in the Panda backend.

## Calendar

Base Path: `/calendar`

### Get Events
Fetch calendar items of type 'event'.

- **URL**: `/events`
- **Method**: `GET`
- **Query Parameters**:
  - `start_time` (string, required): ISO 8601 start time.
  - `end_time` (string, required): ISO 8601 end time.
- **Response**: List of event objects.

### Get Todos
Fetch calendar items of type 'todo'.

- **URL**: `/todos`
- **Method**: `GET`
- **Query Parameters**:
  - `start_time` (string, required): ISO 8601 start time.
  - `end_time` (string, required): ISO 8601 end time.
- **Response**: List of todo objects.

### Get Reminders
Fetch calendar items of type 'reminder'.

- **URL**: `/reminders`
- **Method**: `GET`
- **Query Parameters**:
  - `start_time` (string, required): ISO 8601 start time.
  - `end_time` (string, required): ISO 8601 end time.
- **Response**: List of reminder objects.

---

## Gmail

Base Path: `/gmail`

### Auth Login
Generates the Google Login URL for authentication.

- **URL**: `/auth/login`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "auth_url": "https://accounts.google.com/..."
  }
  ```

---

## Manual Flow

Base Path: `/manual_flow`

### Chat
Trigger the manual workflow with a user message.

- **URL**: `/chat`
- **Method**: `POST`
- **Request Body**: `ChatRequest`
  ```json
  {
    "message": "string"
  }
  ```
- **Response**:
  ```json
  {
    "response": "string",
    "plan": [] 
  }
  ```

---

## Settings

Base Path: `/settings`

### Get Models
Get list of available LLM models per provider.

- **URL**: `/models`
- **Method**: `GET`
- **Response**: Object mapping `LLMProvider` enums to lists of model names.
  ```json
  {
    "mistral": ["open-mistral-7b", ...],
    "cerebras": [...],
    ...
  }
  ```

### Get Agent Configs
Get current configuration for all agents.

- **URL**: `/agents`
- **Method**: `GET`
- **Response**: object mapping agent names to their configurations.

### Update Agent Configs
Update configuration for agents.

- **URL**: `/agents`
- **Method**: `PUT`
- **Request Body**: `SettingsUpdateModel`
  ```json
  {
    "agent_configs": {
      "agent_name": {
        "provider": "string", 
        "model_name": "string",
        "temperature": 0.7 
      }
    }
  }
  ```
  - `provider`: One of existing LLMProvider values (e.g., "mistral", "openai", "anthropic", "gemini", "cerebras", "groq", "openrouter").
  - `temperature`: Float between 0.0 and 1.0.

- **Response**:
  ```json
  {
    "status": "success",
    "message": "Configuration updated successfully",
    "config": { ... }
  }
  ```

---

## Token Tracker

Base Path: `/token-tracker`

### Get Agents
Get a list of all agents that have recorded usage.

- **URL**: `/agents`
- **Method**: `GET`
- **Response**: List of agent names (strings).

### Get Cumulative Stats
Get cumulative token usage statistics for each agent.

- **URL**: `/cumulative`
- **Method**: `GET`
- **Response**: List of `AgentStats`.
  ```json
  [
    {
      "agent_name": "string",
      "total_prompt_tokens": 123,
      "total_completion_tokens": 123,
      "total_tokens": 246,
      "request_count": 10
    }
  ]
  ```

### Get Agent History
Get usage history for a specific agent.

- **URL**: `/agent/{agent_name}`
- **Method**: `GET`
- **Path Parameters**:
  - `agent_name` (string, required)
- **Response**: List of `TokenUsageRecord` (limited to last 100).
  ```json
  [
    {
      "agent_name": "string",
      "prompt_tokens": 10,
      "completion_tokens": 10,
      "total_tokens": 20,
      "model_name": "opt-string",
      "timestamp": "2024-01-01T00:00:00"
    }
  ]
  ```

---

## User Status

Base Path: `/user`

### Get Status
Get the latest user emotion status.

- **URL**: `/status`
- **Method**: `GET`
- **Response**: `UserEmotion` object or message if no data.
  ```json
  {
      "happiness": 5,   // 1-10 scale (1=Very Unhappy, 10=Very Happy)
      "frustration": 1, // 1-10 scale (1=Calm, 10=Very Frustrated)
      "urgency": 1,     // 1-10 scale (1=Low, 10=High)
      "confusion": 1    // 1-10 scale (1=Clear, 10=Very Confused)
  }
  ```
  OR
  ```json
  {
      "status": "No emotion data available"
  }
  ```

---
