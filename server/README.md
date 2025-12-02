# Social Media Manager AI - Django Server

A Django-based REST API server for managing Instagram business accounts with AI-powered content generation capabilities.

## Features

- **User Authentication**: JWT-based authentication with token refresh
- **Instagram Integration**: OAuth integration with Instagram Business API
- **AI Content Generation**: Automated caption and image generation using Hugging Face models
- **Post Management**: Create, schedule, and publish Instagram posts
- **Analytics**: Fetch Instagram insights and engagement metrics
- **Auto-reply**: Automated comment responses

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Git (optional, for version control)
- Instagram Business Account
- Facebook Developer App with Instagram API access
- Hugging Face API key

## Installation & Setup

### 1. Clone the Repository (if applicable)

```bash
git clone https://github.com/Prasun-Shiwakoti/Social-Media-Manager-AI
cd server
```

### 2. Create Virtual Environment

**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```cmd
pip install -r requirements.txt
```

### 4. Environment Variables Setup

Create a `.env` file in the server root directory (where `manage.py` is located):
Use the sample env file for reference.


### 5. Database Setup

Run migrations to create the database tables:

```cmd
python manage.py makemigrations
python manage.py migrate
```

This will create a SQLite database (`db.sqlite3`) with all necessary tables.

### 8. Run the Development Server

Start the Django development server:

```cmd
python manage.py runserver
```

The server will start at `http://localhost:8000/`

## Project Structure

```
server/
├── account/                    # User authentication & Instagram accounts
│   ├── models.py              # CustomUser, IGAccessToken, IGBusinessAccount
│   ├── views.py               # Registration, login, account management
│   ├── serializer.py          # DRF serializers
│   └── urls.py                # Account-related endpoints
├── dashboard/                  # Post generation & management
│   ├── models.py              # PostImage, InstagramPost
│   ├── views.py               # Post generation, publishing, insights
│   └── urls.py                # Dashboard endpoints
├── server/                     # Main Django project
│   ├── settings.py            # Project settings
│   ├── urls.py                # Root URL configuration
│   └── utils/                 # Utility functions
│       ├── instagram_api.py   # Instagram API interactions
│       ├── llm_api_calls.py   # AI model API calls
│       ├── logger.py          # Logging configuration
│       └── utility_functions.py
├── logs/                       # Application logs
├── media/                      # User-uploaded and generated images
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (create this)
├── .env.sample                # Environment variables template
└── db.sqlite3                 # SQLite database (auto-generated)
```

## API Endpoints
For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Technologies Used

- **Django 5.2.8** - Web framework
- **Django REST Framework** - API development
- **djangorestframework-simplejwt** - JWT authentication
- **Hugging Face Hub** - AI model inference
- **Pillow** - Image processing
- **python-decouple** - Environment variable management
- **requests** - HTTP library for API calls

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the API documentation
- Check application logs in the `logs/` directory
- Verify your environment variables are correctly set

## Contributing

Commit messages should follow the format `<type>: <description>`, where `type` is one of the following:

- **feat**: A new feature.
  - Example: `feat: add user login functionality`
- **fix**: A bug fix.
  - Example: `fix: resolve issue with user profile update`
- **docs**: Documentation-only changes.
  - Example: `docs: update README with installation instructions`
- **style**: Changes that do not affect the meaning of the code (e.g., white-space, formatting).
  - Example: `style: format code according to PEP8 guidelines`
- **refactor**: Code changes that neither fix bugs nor add features.
  - Example: `refactor: reorganize project structure`
- **perf**: Changes that improve performance.
  - Example: `perf: optimize database queries`
- **chore**: Changes to the build process or auxiliary tools and libraries.
  - Example: `chore: update dependencies`
