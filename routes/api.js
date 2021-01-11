'use strict';

const Issue = require('../models/Issue');

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      let { project } = req.params;
      let {
        _id,
        issue_title,
        issue_text,
        created_on,
        updated_on,
        created_by,
        assigned_to,
        open,
        status_text,
      } = req.query;

      Issue.find({ project }, function (err, data) {
        if (data) {
          // Get array of issues
          let issueArray = data;

          if (_id) {
            issueArray = issueArray.filter(issue => issue._id.equals(_id));
          }

          if (issue_title) {
            issueArray = issueArray.filter(
              issue => issue.issue_title === issue_title
            );
          }

          if (issue_text) {
            issueArray = issueArray.filter(
              issue => issue.issue_text === issue_text
            );
          }

          if (created_on) {
            issueArray = issueArray.filter(
              issue => issue.created_on === created_on
            );
          }

          if (updated_on) {
            issueArray = issueArray.filter(
              issue => issue.updated_on === updated_on
            );
          }

          if (created_by) {
            issueArray = issueArray.filter(
              issue => issue.created_by === created_by
            );
          }

          if (assigned_to) {
            issueArray = issueArray.filter(
              issue => issue.assigned_to === assigned_to
            );
          }

          if (open) {
            issueArray = issueArray.filter(
              issue => issue.open.toString() === open
            );
          }

          if (status_text) {
            issueArray = issueArray.filter(
              issue => issue.status_text === status_text
            );
          }

          const formatArray = issueArray.map(issue => ({
            _id: issue._id,
            issue_title: issue.issue_title,
            issue_text: issue.issue_text,
            created_on: issue.created_on,
            updated_on: issue.updated_on,
            created_by: issue.created_by,
            assigned_to: issue.assigned_to,
            open: issue.open,
            status_text: issue.status_text,
          }));

          res.json(formatArray);
        } else {
          res.json({
            error: 'Project does not exist',
          });
        }
      });
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

      const record = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        project,
      });

      record
        .save()
        .then(result => {
          res.json({
            _id: result._id,
            issue_title: result.issue_title,
            issue_text: result.issue_text,
            created_by: result.created_by,
            created_on: result.created_on,
            updated_on: result.updated_on,
            assigned_to: result.assigned_to,
            status_text: result.status_text,
            open: result.open,
          });
        })
        .catch(err => {
          res.json({
            error: 'required field(s) missing',
          });
        });
    })

    .put(function (req, res) {
      const fieldArray = [
        'issue_title',
        'issue_text',
        'created_by',
        'assigned_to',
        'open',
        'status_text',
      ];
      let { _id } = req.body;
      let source = req.body;
      let fieldFilter;
      // Filter fields that contains a value
      fieldFilter = fieldArray.filter(
        field => source[field] !== '' && source[field] !== undefined
      );

      if (!_id) {
        res.send({ error: 'missing _id' });
      } else if (fieldFilter.length < 1) {
        res.send({ error: 'no update field(s) sent', _id });
      } else {
        // Format into objects
        let obj = Object.assign(
          ...fieldFilter.map(field => ({ [field]: source[field] }))
        );
        // Add 'updated_on' property to object
        obj['updated_on'] = new Date();

        Issue.findOneAndUpdate({ _id }, obj, function (err, data) {
          if (err) {
            res.send({ error: 'could not update', _id });
          } else {
            res.json({
              result: 'successfully updated',
              _id,
            });
          }
        });
      }
    })

    .delete(function (req, res) {
      let { _id } = req.body;

      if (!_id) {
        res.status(200).json({
          error: 'missing _id',
        });
      } else {
        Issue.findByIdAndRemove(_id, function (err, data) {
          if (err) {
            res.status(200).json({
              error: 'could not delete',
              _id,
            });
          } else {
            res.status(200).json({
              result: 'successfully deleted',
              _id,
            });
          }
        });
      }
    });
};
