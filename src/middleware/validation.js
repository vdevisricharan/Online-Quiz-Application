const { body, param } = require('express-validator');

const validateQuizCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be between 1-200 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

const validateQuestionCreation = [
  param('quizId')
    .isInt({ min: 1 })
    .withMessage('Quiz ID must be a positive integer'),
  body('question_text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Question text is required and must be between 1-500 characters'),
  body('question_type')
    .optional()
    .isIn(['single_choice', 'multiple_choice', 'text'])
    .withMessage('Question type must be single_choice, multiple_choice, or text'),
  body('word_limit')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Word limit must be between 1-300 characters'),
  body('options')
    .optional()
    .isArray()
    .withMessage('Options must be an array'),
  body('options.*.text')
    .if(body('options').exists())
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Option text must be between 1-200 characters'),
  body('options.*.is_correct')
    .if(body('options').exists())
    .optional()
    .isBoolean()
    .withMessage('is_correct must be a boolean'),
  
  // Custom validation for correct answers
  body('options').custom((options, { req }) => {
    if (!options || options.length === 0) return true;
    
    const questionType = req.body.question_type || 'single_choice';
    const correctOptions = options.filter(opt => opt.is_correct);

    if (questionType === 'single_choice' && correctOptions.length !== 1) {
      throw new Error('Single choice questions must have exactly one correct answer');
    }
    
    if (questionType === 'multiple_choice' && correctOptions.length === 0) {
      throw new Error('Multiple choice questions must have at least one correct answer');
    }

    return true;
  })
];

const validateQuizSubmission = [
  param('quizId')
    .isInt({ min: 1 })
    .withMessage('Quiz ID must be a positive integer'),
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be a non-empty array'),
  body('answers.*.question_id')
    .isInt({ min: 1 })
    .withMessage('Question ID must be a positive integer'),
  body('answers.*.option_ids')
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(id => Number.isInteger(id) && id > 0);
      } else {
        return Number.isInteger(value) && value > 0;
      }
    })
    .withMessage('Option IDs must be positive integers or array of positive integers')
];

module.exports = {
  validateQuizCreation,
  validateQuestionCreation,
  validateQuizSubmission
};