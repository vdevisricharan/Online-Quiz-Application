# Online Quiz Application API

A comprehensive backend API for a quiz application built with Node.js, Express, and SQLite.

## Features

### Core Features
- ✅ Quiz Management (Create, List, View)
- ✅ Question Management (Add questions with multiple options)
- ✅ Quiz Taking (Fetch questions, Submit answers, Get scores)
- ✅ SQLite Database with proper relationships

### Bonus Features
- ✅ Comprehensive validation for different question types
- ✅ Support for single choice, multiple choice, and text questions
- ✅ Word limit validation for text questions (max 300 characters)
- ✅ Unit tests with Jest and Supertest
- ✅ RESTful API design
- ✅ Clean architecture with separation of concerns

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Validation**: express-validator
- **Testing**: Jest + Supertest
- **CORS**: cors middleware

## Project Structure

```
src/
├── app.js                 # Application entry point
├── config/
│   └── database.js        # Database configuration and initialization
├── controllers/
│   ├── quizController.js  # Quiz-related request handlers
│   └── questionController.js # Question-related request handlers
├── services/
│   ├── quizService.js     # Quiz business logic
│   └── questionService.js # Question business logic
├── routes/
│   └── quizRoutes.js      # API routes
├── middleware/
│   ├── validation.js      # Request validation middleware
│   └── errorHandler.js    # Global error handling
tests/
└── quiz.test.js           # Unit tests
```

## API Endpoints

### Quiz Management

#### Create Quiz
```http
POST /api/quizzes
Content-Type: application/json

{
  "title": "JavaScript Basics",
  "description": "Test your JavaScript knowledge"
}
```

#### Get All Quizzes
```http
GET /api/quizzes
```

#### Get Quiz by ID
```http
GET /api/quizzes/:id
```

### Question Management

#### Add Question to Quiz
```http
POST /api/quizzes/:quizId/questions
Content-Type: application/json

{
  "question_text": "What is the output of console.log(typeof null)?",
  "question_type": "single_choice",
  "options": [
    { "text": "null", "is_correct": false },
    { "text": "object", "is_correct": true },
    { "text": "undefined", "is_correct": false }
  ]
}
```

#### Get Quiz Questions
```http
GET /api/quizzes/:quizId/questions
```

### Quiz Taking

#### Submit Quiz Answers
```http
POST /api/quizzes/:quizId/submit
Content-Type: application/json

{
  "answers": [
    {
      "question_id": 1,
      "option_ids": 2
    },
    {
      "question_id": 2,
      "option_ids": [3, 4]
    }
  ]
}
```

## Question Types

1. **Single Choice**: Exactly one correct answer
2. **Multiple Choice**: One or more correct answers
3. **Text**: Text-based questions with optional word limit (max 300 chars)

## Installation & Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Start the server**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

3. **Run tests**:
```bash
npm test
```

## Database Schema

### Quizzes Table
- `id` (PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Questions Table
- `id` (PRIMARY KEY)
- `quiz_id` (FOREIGN KEY)
- `question_text` (TEXT, NOT NULL)
- `question_type` (TEXT, CHECK constraint)
- `word_limit` (INTEGER, for text questions)
- `created_at` (DATETIME)

### Options Table
- `id` (PRIMARY KEY)
- `question_id` (FOREIGN KEY)
- `option_text` (TEXT, NOT NULL)
- `is_correct` (BOOLEAN)
- `created_at` (DATETIME)

### Quiz Submissions Table
- `id` (PRIMARY KEY)
- `quiz_id` (FOREIGN KEY)
- `score` (INTEGER)
- `total_questions` (INTEGER)
- `submitted_at` (DATETIME)

## Validation Rules

- Quiz title: 1-200 characters
- Question text: 1-500 characters
- Option text: 1-200 characters
- Word limit for text questions: 1-300 characters
- Single choice questions: exactly 1 correct answer
- Multiple choice questions: at least 1 correct answer

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Database constraint violations
- Foreign key violations
- Resource not found errors
- Internal server errors

## Testing

The project includes comprehensive unit tests covering:
- Quiz creation and retrieval
- Question management
- Answer submission and scoring
- Validation edge cases
- Error scenarios

Run tests with:
```bash
npm test
```

## Example Usage

### 1. Create a Quiz
```bash
curl -X POST http://localhost:3000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Quiz",
    "description": "Test your JS knowledge"
  }'
```

### 2. Add Questions
```bash
# Single Choice Question
curl -X POST http://localhost:3000/api/quizzes/1/questions \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "What is the correct way to declare a variable in JavaScript?",
    "question_type": "single_choice",
    "options": [
      {"text": "var x = 5;", "is_correct": true},
      {"text": "variable x = 5;", "is_correct": false},
      {"text": "v x = 5;", "is_correct": false}
    ]
  }'

# Multiple Choice Question
curl -X POST http://localhost:3000/api/quizzes/1/questions \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Which of the following are JavaScript data types?",
    "question_type": "multiple_choice",
    "options": [
      {"text": "String", "is_correct": true},
      {"text": "Number", "is_correct": true},
      {"text": "Float", "is_correct": false},
      {"text": "Boolean", "is_correct": true}
    ]
  }'

# Text Question
curl -X POST http://localhost:3000/api/quizzes/1/questions \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Explain the concept of closures in JavaScript",
    "question_type": "text",
    "word_limit": 100
  }'
```

### 3. Take Quiz
```bash
# Get questions (without correct answers)
curl http://localhost:3000/api/quizzes/1/questions

# Submit answers
curl -X POST http://localhost:3000/api/quizzes/1/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"question_id": 1, "option_ids": 1},
      {"question_id": 2, "option_ids": [1, 2, 4]}
    ]
  }'
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "details": [ ... ] // Optional validation details
}
```

### Quiz Submission Response
```json
{
  "success": true,
  "data": {
    "score": 7,
    "total": 10,
    "percentage": 70
  }
}
```

## Environment Variables

Create a `.env` file for configuration:
```env
PORT=3000
NODE_ENV=development
DB_PATH=./quiz_app.db
```
