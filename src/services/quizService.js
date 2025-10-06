const { db } = require('../config/database');

class QuizService {
  createQuiz(title, description = '') {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO quizzes (title, description) VALUES (?, ?)';
      db.run(query, [title, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            title,
            description,
            created_at: new Date().toISOString()
          });
        }
      });
    });
  }

  getAllQuizzes() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT q.*, 
               COUNT(quest.id) as question_count
        FROM quizzes q
        LEFT JOIN questions quest ON q.id = quest.quiz_id
        GROUP BY q.id
        ORDER BY q.created_at DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getQuizById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT q.*, 
               COUNT(quest.id) as question_count
        FROM quizzes q
        LEFT JOIN questions quest ON q.id = quest.quiz_id
        WHERE q.id = ?
        GROUP BY q.id
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async submitQuiz(quizId, answers) {
    return new Promise((resolve, reject) => {
      // First, get all questions for this quiz with their correct answers
      const query = `
        SELECT q.id as question_id, o.id as option_id, o.is_correct, q.question_type
        FROM questions q
        JOIN options o ON q.id = o.question_id
        WHERE q.quiz_id = ?
      `;

      db.all(query, [quizId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Group by question
        const questionsMap = {};
        rows.forEach(row => {
          if (!questionsMap[row.question_id]) {
            questionsMap[row.question_id] = {
              type: row.question_type,
              correctOptions: [],
              allOptions: []
            };
          }
          questionsMap[row.question_id].allOptions.push(row.option_id);
          if (row.is_correct) {
            questionsMap[row.question_id].correctOptions.push(row.option_id);
          }
        });

        let score = 0;
        const totalQuestions = Object.keys(questionsMap).length;

        // Calculate score based on answers
        answers.forEach(answer => {
          const questionId = answer.question_id;
          const selectedOptions = Array.isArray(answer.option_ids) 
            ? answer.option_ids 
            : [answer.option_ids];

          if (questionsMap[questionId]) {
            const question = questionsMap[questionId];
            
            if (question.type === 'multiple_choice') {
              // For multiple choice, all correct options must be selected and no incorrect ones
              const correctSet = new Set(question.correctOptions);
              const selectedSet = new Set(selectedOptions);
              
              if (correctSet.size === selectedSet.size && 
                  [...correctSet].every(id => selectedSet.has(id))) {
                score++;
              }
            } else {
              // For single choice, check if the selected option is correct
              if (selectedOptions.length === 1 && 
                  question.correctOptions.includes(selectedOptions[0])) {
                score++;
              }
            }
          }
        });

        // Store submission
        const insertQuery = 'INSERT INTO quiz_submissions (quiz_id, score, total_questions) VALUES (?, ?, ?)';
        db.run(insertQuery, [quizId, score, totalQuestions], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              score,
              total: totalQuestions,
              percentage: Math.round((score / totalQuestions) * 100)
            });
          }
        });
      });
    });
  }
}

module.exports = new QuizService();