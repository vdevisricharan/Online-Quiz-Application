const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const questionController = require('../controllers/questionController');
const {
  validateQuizCreation,
  validateQuestionCreation,
  validateQuizSubmission
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The quiz ID
 *         title:
 *           type: string
 *           description: The quiz title
 *         description:
 *           type: string
 *           description: The quiz description
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The question ID
 *         question_text:
 *           type: string
 *           description: The question text
 *         question_type:
 *           type: string
 *           enum: [single_choice, multiple_choice]
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               text:
 *                 type: string
 *               is_correct:
 *                 type: boolean
 */

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 */
router.post('/', validateQuizCreation, quizController.createQuiz);

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     responses:
 *       200:
 *         description: List of all quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 */
router.get('/', quizController.getAllQuizzes);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get a quiz by ID
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 */
router.get('/:id', quizController.getQuizById);

/**
 * @swagger
 * /api/quizzes/{quizId}/questions:
 *   post:
 *     summary: Add a question to a quiz
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question_text
 *               - options
 *             properties:
 *               question_text:
 *                 type: string
 *               question_type:
 *                 type: string
 *                 enum: [single_choice, multiple_choice]
 *                 default: single_choice
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     is_correct:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 */
router.post('/:quizId/questions', validateQuestionCreation, questionController.addQuestion);

/**
 * @swagger
 * /api/quizzes/{quizId}/questions:
 *   get:
 *     summary: Get all questions for a quiz
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: List of questions for the quiz
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
router.get('/:quizId/questions', questionController.getQuizQuestions);

/**
 * @swagger
 * /api/quizzes/{quizId}/submit:
 *   post:
 *     summary: Submit answers for a quiz
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - question_id
 *                     - option_ids
 *                   properties:
 *                     question_id:
 *                       type: integer
 *                     option_ids:
 *                       oneOf:
 *                         - type: integer
 *                         - type: array
 *                           items:
 *                             type: integer
 *     responses:
 *       200:
 *         description: Quiz submission result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 percentage:
 *                   type: number
 */
router.post('/:quizId/submit', validateQuizSubmission, quizController.submitQuiz);

module.exports = router;