// Generated TypeScript definitions for Other Pack
import type { DataPack, Scenario, Persona } from '@synthkit/sdk';

export const OTHER_BASICFUNCTIONA_PACK: DataPack = {
  "id": "other-basicfunctiona",
  "name": "Other Pack",
  "description": "Custom pack for basic functionality business",
  "version": "1.0.0",
  "schemas": {
    "users": {
      "type": "object",
      "description": "Users entity",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Users identifier"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time",
        },
        "email": {
          "type": "string",
          "format": "email",
        },
        "firstName": {
          "type": "string",
        },
        "lastName": {
          "type": "string",
        },
        "status": {
          "type": "string",
          "enum": [
            "active",
            "inactive",
            "suspended"
          ],
          "default": "active"
        }
      },
      "required": [
        "id",
        "createdAt",
        "email",
        "firstName",
        "lastName"
      ]
    }
  },
  "scenarios": {
    "early": {
      "id": "early",
      "name": "Early Other",
      "description": "Early stage other with basic functionality",
      "config": {
        "seed": 811,
        "dateRange": {
          "start": "2024-01-01",
          "end": "2024-12-31"
        },
        "volume": {
          "users": 500
        },
        "relationships": {}
      }
    }
  },
  "personas": {
    "user": {
      "id": "user",
      "name": "User",
      "description": "User persona for other business",
      "preferences": {
        "locale": "en-US",
        "timezone": "America/New_York",
        "currency": "USD"
      },
      "overrides": {
        "user": {
          "role": "user",
          "permissions": [
            "read"
          ]
        }
      }
    },
    "admin": {
      "id": "admin",
      "name": "Admin",
      "description": "Admin persona for other business",
      "preferences": {
        "locale": "en-US",
        "timezone": "America/New_York",
        "currency": "USD"
      },
      "overrides": {
        "user": {
          "role": "admin",
          "permissions": [
            "read",
            "write",
            "delete",
            "admin"
          ]
        }
      }
    },
    "general_users": {
      "id": "general_users",
      "name": "General users",
      "description": "General users persona representing target audience",
      "preferences": {
        "locale": "en-US",
        "timezone": "America/New_York",
        "currency": "USD"
      },
      "overrides": {}
    }
  },
  "routes": {
    "/api/users": {
      "method": "GET",
      "path": "/api/users",
      "schema": "users"
    }
  }
};
