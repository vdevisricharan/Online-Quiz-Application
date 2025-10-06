const { db } = require('../config/database');

class QuestionService {
  async addQuestion(quizId, questionData) {
    const { question_text, question_type = 'single_choice', word_limit, options } = questionData;
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Insert question
        const questionQuery = `
          INSERT INTO questions (quiz_id, question_text, question_type, word_limit) 
          VALUES (?, ?, ?, ?)
        `;
        
        db.run(questionQuery, [quizId, question_text, question_type, word_limit], function(err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }

          const questionId = this.lastID;
          let optionsInserted = 0;
          const questionResult = {
            id: questionId,
            quiz_id: quizId,
            question_text,
            question_type,
            word_limit,
            options: []
          };

          // Insert options if provided
          if (options && options.length > 0) {
            const optionQuery = 'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)';
            
            options.forEach((option, index) => {
              db.run(optionQuery, [questionId, option.text, option.is_correct || false], function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }

                questionResult.options.push({
                  id: this.lastID,
                  text: option.text,
                  is_correct: option.is_correct || false
                });

                optionsInserted++;
                if (optionsInserted === options.length) {
                  db.run('COMMIT', (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(questionResult);
                    }
                  });
                }
              });
            });
          } else {
            db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(questionResult);
              }
            });
          }
        });
      });
    });
  }

  getQuizQuestions(quizId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          q.id,
          q.question_text,
          q.question_type,
          q.word_limit,
          o.id as option_id,
          o.option_text
        FROM questions q
        LEFT JOIN options o ON q.id = o.question_id
        WHERE q.quiz_id = ?
        ORDER BY q.id, o.id
      `;

      db.all(query, [quizId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Group questions with their options
        const questionsMap = {};
        
        rows.forEach(row => {
          if (!questionsMap[row.id]) {
            questionsMap[row.id] = {
              id: row.id,
              question_text: row.question_text,
              question_type: row.question_type,
              word_limit: row.word_limit,
              options: []
            };
          }

          if (row.option_id) {
            questionsMap[row.id].options.push({
              id: row.option_id,
              text: row.option_text
            });
          }
        });

        resolve(Object.values(questionsMap));
      });
    });
  }
}

module.exports = new QuestionService();