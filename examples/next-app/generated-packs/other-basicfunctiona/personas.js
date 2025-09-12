export const personas = {
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
};