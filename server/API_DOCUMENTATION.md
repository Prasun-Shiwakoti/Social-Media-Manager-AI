# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
Most endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## Table of Contents
1. [Account Management](#account-management)
2. [Instagram Business Account Management](#instagram-business-account-management)
3. [Post Generation](#post-generation)
4. [Post Management](#post-management)
5. [Instagram Profile & Posts](#instagram-profile--posts)
6. [Instagram Insights](#instagram-insights)
7. [Instagram Comments](#instagram-comments)

---

## Account Management

### 1. User Registration
Register a new user account.

**Endpoint:** `POST /account/register/`

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string (optional)",
  "last_name": "string (optional)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/account/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Success Response (201):**
```json
{
  "message": "User registered successfully.",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Response (400):**
```json
{
  "error": "Error message describing what went wrong"
}
```

---

### 2. Obtain JWT Token
Login to get access and refresh tokens.

**Endpoint:** `POST /account/token/`

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/account/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

**Success Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 3. Refresh JWT Token
Get a new access token using refresh token.

**Endpoint:** `POST /account/token/refresh/`

**Authentication:** Not required

**Request Body:**
```json
{
  "refresh": "string"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/account/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }'
```

**Success Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 6. List Business Accounts
Get all Instagram Business Accounts for authenticated user.

**Endpoint:** `GET /account/business-accounts/`

**Authentication:** Required

**Example Request:**
```bash
curl -X GET http://localhost:8000/account/business-accounts/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "business_account_id": "17841405793187218",
    "name": "My Business",
    "description": "Business description",
    "logo": null,
    "access_token_data": {
      "id": 1,
      "access_token": "hidden",
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-01T10:00:00Z",
      "expires_at": "2025-01-30T10:00:00Z"
    },
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z",
    "auto_reply_enabled": false
  }
]
```

---

### 7. Create Business Account
Create a new Instagram Business Account.

**Endpoint:** `POST /account/business-accounts/`

**Authentication:** Required

**Request Body:**
```json
{
  "business_account_id": "string",
  "name": "string",
  "description": "string (optional)",
  "access_token": "string",
  "auto_reply_enabled": "boolean (optional)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/account/business-accounts/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "business_account_id": "17841405793187218",
    "name": "My Business",
    "description": "A social media business account",
    "access_token": "IGQVJ...",
    "auto_reply_enabled": false
  }'
```

**Success Response (201):**
```json
{
  "id": 1,
  "business_account_id": "17841405793187218",
  "name": "My Business",
  "description": "A social media business account",
  "logo": null,
  "access_token_data": {
    "id": 1,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z",
    "expires_at": "2025-01-30T10:00:00Z"
  },
  "created_at": "2024-12-01T10:00:00Z",
  "updated_at": "2024-12-01T10:00:00Z",
  "auto_reply_enabled": false
}
```

---

### 8. Get Business Account Details
Retrieve a specific business account.

**Endpoint:** `GET /account/business-accounts/{id}/`

**Authentication:** Required

**Path Parameters:**
- `id` (integer): Business account ID

**Example Request:**
```bash
curl -X GET http://localhost:8000/account/business-accounts/1/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
{
  "id": 1,
  "business_account_id": "17841405793187218",
  "name": "My Business",
  "description": "A social media business account",
  "logo": null,
  "access_token_data": {
    "id": 1,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z",
    "expires_at": "2025-01-30T10:00:00Z"
  },
  "created_at": "2024-12-01T10:00:00Z",
  "updated_at": "2024-12-01T10:00:00Z",
  "auto_reply_enabled": false
}
```

---

### 9. Update Business Account
Update an existing business account.

**Endpoint:** `PUT /account/business-accounts/{id}/`

**Authentication:** Required

**Path Parameters:**
- `id` (integer): Business account ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "access_token": "string (optional)",
  "auto_reply_enabled": "boolean (optional)"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8000/account/business-accounts/1/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Business Name",
    "auto_reply_enabled": true
  }'
```

**Success Response (200):**
```json
{
  "id": 1,
  "business_account_id": "17841405793187218",
  "name": "Updated Business Name",
  "description": "A social media business account",
  "logo": null,
  "access_token_data": {
    "id": 1,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-02T10:00:00Z",
    "expires_at": "2025-01-30T10:00:00Z"
  },
  "created_at": "2024-12-01T10:00:00Z",
  "updated_at": "2024-12-02T10:00:00Z",
  "auto_reply_enabled": true
}
```

---

### 10. Delete Business Account
Delete a business account.

**Endpoint:** `DELETE /account/business-accounts/{id}/`

**Authentication:** Required

**Path Parameters:**
- `id` (integer): Business account ID

**Example Request:**
```bash
curl -X DELETE http://localhost:8000/account/business-accounts/1/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (204):**
```json
{
  "message": "Business account 'My Business' deleted successfully."
}
```

---

## Post Generation

### 11. Generate Caption
Generate an Instagram caption using AI based on a prompt.

**Endpoint:** `POST /dashboard/generate_caption/`

**Authentication:** Required

**Request Body:**
```json
{
  "short_prompt": "string",
  "expanded_prompt": "string (optional)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/dashboard/generate_caption/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "short_prompt": "A sunset at the beach",
    "expanded_prompt": "A beautiful golden sunset over calm ocean waters"
  }'
```

**Success Response (200):**
```json
{
  "caption": "Chasing sunsets and ocean dreams 🌅✨ #BeachVibes #GoldenHour"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

### 12. Generate Image
Generate an AI image based on a prompt.

**Endpoint:** `POST /dashboard/generate_image/`

**Authentication:** Required

**Request Body:**
```json
{
  "prompt": "string"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/dashboard/generate_image/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cool modern looking post for Instagram"
  }'
```

**Success Response (200):**
```json
{
  "image_url": "/media/post_images/generated_A_cool_modern_looking_post_fo.webp"
}
```

**Error Response (400):**
```json
{
  "error": "Prompt is required."
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

### 13. Generate Complete Post
Generate a complete Instagram post (image + caption) from a single prompt.

**Endpoint:** `POST /dashboard/generate_post/`

**Authentication:** Required

**Request Body:**
```json
{
  "prompt": "string"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/dashboard/generate_post/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "motivational fitness post"
  }'
```

**Success Response (201):**
```json
{
  "expanded_prompt": "A powerful motivational fitness scene featuring a determined athlete training at dawn, sweat glistening on their skin, with dramatic morning light streaming through a modern gym, showcasing dedication and strength",
  "caption": "Push harder today for a stronger tomorrow 💪🔥 #FitnessMotivation #NoExcuses",
  "image_url": "/media/post_images/generated_motivational_fitness_post.webp"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

### 14. Publish Post to Instagram
Publish a post to Instagram with image and caption.

**Endpoint:** `POST /dashboard/publish_post/`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `caption` (string, required): Post caption
- `image` (file, optional): Image file to upload
- `image_url` (string, optional): Public URL of image (if not uploading file)

Note: Either `image` or `image_url` must be provided. `image_url` is preferred.

**Example Request:**
```bash
curl -X POST http://localhost:8000/dashboard/publish_post/ \
  -H "Authorization: Bearer <your_access_token>" \
  -F "caption=Amazing sunset vibes! 🌅" \
  -F "image=@/path/to/image.jpg"
```

**Success Response (200):**
```json
{
  "message": "Post published successfully",
  "post_link": "https://www.instagram.com/p/CxYz123AbCD/",
  "media_id": "17841405793187218"
}
```

**Error Response (400):**
```json
{
  "error": "Image file or URL is required"
}
```

**Error Response (404):**
```json
{
  "error": "Post not found"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

## Post Management

### 15. Get Post by Short Code
Retrieve details of a post created by the system using its short code.

**Endpoint:** `GET /dashboard/post/{short_code}/`

**Authentication:** Required

**Path Parameters:**
- `short_code` (string): Instagram post short code (from post URL)

**Example Request:**
```bash
curl -X GET http://localhost:8000/dashboard/post/CxYz123AbCD/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
{
  "business_account": "My Business",
  "caption": "Amazing sunset vibes! 🌅",
  "media_url": "/media/post_images/image123.webp",
  "created_at": "2024-12-01T15:30:00Z",
  "is_posted": true,
  "post_id": 1,
  "short_code": "CxYz123AbCD"
}
```

**Error Response (403):**
```json
{
  "error": "Unauthorized access"
}
```

**Error Response (404):**
```json
{
  "error": "Post not found"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

## Instagram Profile & Posts

### 16. Fetch Instagram Profile
Get Instagram Business Account profile information.

**Endpoint:** `GET /dashboard/instagram/profile/`

**Authentication:** Required

**Example Request:**
```bash
curl -X GET http://localhost:8000/dashboard/instagram/profile/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
{
  "profile": {
    "id": "17841405793187218",
    "username": "mybusiness_insta",
    "account_type": "BUSINESS",
    "media_count": 245
  }
}
```

**Error Response (404):**
```json
{
  "error": "Instagram Business Account not found."
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

### 17. Get All Instagram Posts
Retrieve all posts from the user's Instagram account.

**Endpoint:** `GET /dashboard/instagram/posts/`

**Authentication:** Required

**Example Request:**
```bash
curl -X GET http://localhost:8000/dashboard/instagram/posts/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
{
  "posts": [
    {
      "id": "17841405793187218",
      "caption": "Amazing sunset vibes! 🌅",
      "media_type": "IMAGE",
      "media_url": "https://scontent.cdninstagram.com/...",
      "permalink": "https://www.instagram.com/p/CxYz123AbCD/",
      "thumbnail_url": null,
      "timestamp": "2024-12-01T15:30:00+0000"
    },
    {
      "id": "17841405793187219",
      "caption": "Morning workout complete 💪",
      "media_type": "VIDEO",
      "media_url": "https://scontent.cdninstagram.com/...",
      "permalink": "https://www.instagram.com/p/CxYz124AbCE/",
      "thumbnail_url": "https://scontent.cdninstagram.com/...",
      "timestamp": "2024-12-02T08:00:00+0000"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Instagram Business Account not found"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

### 18. Get Instagram Post Details
Get detailed information about a specific Instagram post.

**Endpoint:** `GET /dashboard/instagram/post/{media_id}/`

**Authentication:** Required

**Path Parameters:**
- `media_id` (string): Instagram media ID

**Example Request:**
```bash
curl -X GET http://localhost:8000/dashboard/instagram/post/17841405793187218/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
{
  "post_details": {
    "id": "17841405793187218",
    "caption": "Amazing sunset vibes! 🌅",
    "media_type": "IMAGE",
    "media_url": "https://scontent.cdninstagram.com/...",
    "permalink": "https://www.instagram.com/p/CxYz123AbCD/",
    "thumbnail_url": null,
    "timestamp": "2024-12-01T15:30:00+0000"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Instagram Business Account not found"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

## Instagram Insights

### 19. Get Account Insights
Retrieve Instagram account-level insights and analytics.

**Endpoint:** `GET /dashboard/instagram/insights/`

**Authentication:** Required

**Example Request:**
```bash
curl -X GET http://localhost:8000/dashboard/instagram/insights/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
{
  "insights": {
    "account_metrics": {
      "reach": [{"value": 5420}],
      "impressions": [{"value": 8350}],
      "profile_views": [{"value": 320}],
      "accounts_engaged": [{"value": 450}],
      "follower_count": [{"value": 2150}],
      "likes": [{"value": 1230}],
      "comments": [{"value": 89}],
      "saved": [{"value": 45}],
      "shares": [{"value": 32}]
    },
    "demographics": {
      "follower_demographics": {
        "country": [
          {"US": 450},
          {"GB": 230},
          {"CA": 180}
        ],
        "city": [
          {"New York": 120},
          {"London": 95}
        ],
        "age_gender": {
          "18-24.M": 350,
          "25-34.F": 420,
          "35-44.M": 280
        }
      }
    }
  }
}
```

**Error Response (404):**
```json
{
  "error": "Instagram Business Account not found"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

### 20. Get Post Insights
Get insights and analytics for a specific Instagram post.

**Endpoint:** `GET /dashboard/instagram/post/{media_id}/insights/`

**Authentication:** Required

**Path Parameters:**
- `media_id` (string): Instagram media ID

**Example Request:**
```bash
curl -X GET http://localhost:8000/dashboard/instagram/post/17841405793187218/insights/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
{
  "insights": {
    "reach": [{"value": 1450}],
    "impressions": [{"value": 2350}],
    "engagement": [{"value": 187}],
    "saved": [{"value": 23}],
    "video_views": [{"value": 0}],
    "carousel_album_impressions": null,
    "carousel_album_reach": null,
    "carousel_album_engagement": null
  }
}
```

**Error Response (404):**
```json
{
  "error": "Instagram Business Account not found"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

## Instagram Comments

### 21. Get Post Comments
Retrieve all comments on a specific Instagram post.

**Endpoint:** `GET /dashboard/instagram/post/{media_id}/comments/`

**Authentication:** Required

**Path Parameters:**
- `media_id` (string): Instagram media ID

**Example Request:**
```bash
curl -X GET http://localhost:8000/dashboard/instagram/post/17841405793187218/comments/ \
  -H "Authorization: Bearer <your_access_token>"
```

**Success Response (200):**
```json
{
  "comments": [
    {
      "id": "17841405793187220",
      "text": "Love this! 😍",
      "username": "user123",
      "timestamp": "2024-12-01T16:15:00+0000"
    },
    {
      "id": "17841405793187221",
      "text": "Amazing shot!",
      "username": "photographer_jane",
      "timestamp": "2024-12-01T16:30:00+0000"
    },
    {
      "id": "17841405793187222",
      "text": "Where was this taken?",
      "username": "travel_lover",
      "timestamp": "2024-12-01T17:00:00+0000"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Instagram Business Account not found"
}
```

**Error Response (500):**
```json
{
  "error": "Error message"
}
```

---

## Error Codes Summary

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 204 | No content (successful deletion) |
| 400 | Bad request (missing or invalid parameters) |
| 401 | Unauthorized (invalid or missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Notes

1. **Authentication**: Most endpoints require JWT authentication. Use the token obtained from `/account/token/` endpoint.

2. **Token Expiry**: Access tokens expire after 5 minutes. Use the refresh token to get a new access token via `/account/token/refresh/`.

3. **Instagram Business Account**: Many dashboard endpoints require that the user has set up an Instagram Business Account through the system.

4. **File Uploads**: When uploading files (e.g., publishing posts), use `multipart/form-data` content type.

5. **Rate Limits**: Instagram API has rate limits. Be mindful when making frequent requests to Instagram-related endpoints.

6. **Media IDs**: Instagram media IDs are long numeric strings. Short codes are the alphanumeric codes seen in Instagram URLs.

7. **AI Generation**: The generate_post, generate_image, and generate_caption endpoints use AI models and may take several seconds to respond.

8. **Instagram Insights**: Some metrics may return null or empty arrays if the account doesn't meet Instagram's requirements for insights (e.g., minimum follower count, business account type).

---

## Complete Example Workflow

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:8000/account/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "email": "john@example.com", "password": "pass123", "first_name": "John", "last_name": "Doe"}'

# Login (or use tokens from registration)
curl -X POST http://localhost:8000/account/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "password": "pass123"}'
```

### 2. Setup Instagram Business Account
```bash
# Create business account
curl -X POST http://localhost:8000/account/business-accounts/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"business_account_id": "17841405793187218", "name": "My Business", "access_token": "IGQVJx..."}'
```

### 3. Generate and Publish a Post
```bash
# Generate complete post
curl -X POST http://localhost:8000/dashboard/generate_post/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "inspiring sunset at the beach"}'

# Publish to Instagram
curl -X POST http://localhost:8000/dashboard/publish_post/ \
  -H "Authorization: Bearer <access_token>" \
  -F "caption=Chasing sunsets 🌅" \
  -F "image_url=https://www.public_image_url.com/generated_image.webp"
```

### 4. Check Analytics
```bash
# Get account insights
curl -X GET http://localhost:8000/dashboard/instagram/insights/ \
  -H "Authorization: Bearer <access_token>"

# Get specific post insights
curl -X GET http://localhost:8000/dashboard/instagram/post/17841405793187218/insights/ \
  -H "Authorization: Bearer <access_token>"
```
