'use strict';

const Issue = require('../models/Issue');

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
    })

    .post(function (req, res) {
      let { project } = req.params;
      let {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      let issue = {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      };

      Issue.findOneAndUpdate(
        { project },
        { $push: { issues: issue } },
        function (err, data) {
          if (!data) {
            const record = new Issue({
              project: project,
              issues: [issue],
            });

            record
              .save()
              .then(result => {
                res.json(result.issues);
              })
              .catch(err => {
                console.log(err);
              });
          } else {
            res.json(data.issues);
          }
        }
      );
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
