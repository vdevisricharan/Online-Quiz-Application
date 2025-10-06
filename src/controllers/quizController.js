const quizService = require('../services/quizService');
const { validationResult } = require('express-validator');

class QuizController {
  async createQuiz(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { title, description } = req.body;
      const quiz = await quizService.createQuiz(title, description);
      
      res.status(201).json({
        success: true,
        data: quiz,
        message: 'Quiz created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllQuizzes(req, res, next) {
    try {
      const quizzes = await quizService.getAllQuizzes();
      
      res.json({
        success: true,
        data: quizzes,
        count: quizzes.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuizById(req, res, next) {
    try {
      const { id } = req.params;
      const quiz = await quizService.getQuizById(id);
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      res.json({
        success: true,
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  }

  async submitQuiz(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { quizId } = req.params;
      const { answers } = req.body;
      
      const result = await quizService.submitQuiz(quizId, answers);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuizController();