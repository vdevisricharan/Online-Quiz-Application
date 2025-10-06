const request = require('supertest');
const app = require('../src/app');

describe('Quiz API', () => {
  let quizId;

  beforeAll(async () => {
    // Wait for database initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('POST /api/quizzes', () => {
    test('should create a new quiz', async () => {
      const quizData = {
        title: 'Test Quiz',
        description: 'A test quiz for unit testing'
      };

      const response = await request(app)
        .post('/api/quizzes')
        .send(quizData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(quizData.title);
      expect(response.body.data.id).toBeDefined();
      
      quizId = response.body.data.id;
    });

    test('should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/quizzes')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/quizzes', () => {
    test('should return all quizzes', async () => {
      const response = await request(app)
        .get('/api/quizzes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/quizzes/:quizId/questions', () => {
    test('should add a question to quiz', async () => {
      const questionData = {
        question_text: 'What is the capital of France?',
        question_type: 'single_choice',
        options: [
          { text: 'Paris', is_correct: true },
          { text: 'London', is_correct: false },
          { text: 'Berlin', is_correct: false },
          { text: 'Madrid', is_correct: false }
        ]
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send(questionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.question_text).toBe(questionData.question_text);
      expect(response.body.data.options).toHaveLength(4);
    });

    test('should fail with invalid question type', async () => {
      const questionData = {
        question_text: 'Invalid question',
        question_type: 'single_choice',
        options: [
          { text: 'Option 1', is_correct: true },
          { text: 'Option 2', is_correct: true } // Multiple correct for single choice
        ]
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send(questionData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/quizzes/:quizId/questions', () => {
    test('should return questions without correct answers', async () => {
      const response = await request(app)
        .get(`/api/quizzes/${quizId}/questions`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].options[0]).not.toHaveProperty('is_correct');
    });
  });

  describe('POST /api/quizzes/:quizId/submit', () => {
    test('should submit quiz answers and return score', async () => {
      // First get questions to know the IDs
      const questionsResponse = await request(app)
        .get(`/api/quizzes/${quizId}/questions`);

      const questions = questionsResponse.body.data;
      const answers = [{
        question_id: questions[0].id,
        option_ids: questions[0].options[0].id // First option (Paris - correct)
      }];

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send({ answers })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBeDefined();
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.percentage).toBeDefined();
    });
  });
});