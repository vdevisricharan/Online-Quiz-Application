const questionService = require('../services/questionService');
const { validationResult } = require('express-validator');

class QuestionController {
  async addQuestion(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { quizId } = req.params;
      const questionData = req.body;
      
      const question = await questionService.addQuestion(quizId, questionData);
      
      res.status(201).json({
        success: true,
        data: question,
        message: 'Question added successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuizQuestions(req, res, next) {
    try {
      const { quizId } = req.params;
      const questions = await questionService.getQuizQuestions(quizId);
      
      res.json({
        success: true,
        data: questions,
        count: questions.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionController();