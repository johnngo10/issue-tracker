const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let _id;

suite('Functional Tests', function () {
  suite('POST /api/issues/{project} => issue object', function () {
    test('Every field', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .type('form')
        .send({
          method: 'post',
          issue_title: 'Fix error in posting data',
          issue_text: 'When we post data it has an error.',
          created_by: 'John',
          assigned_to: 'Joe',
          status_text: 'In QA',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Fix error in posting data');
          assert.equal(
            res.body.issue_text,
            'When we post data it has an error.'
          );
          assert.equal(res.body.created_by, 'John');
          assert.equal(res.body.assigned_to, 'Joe');
          assert.equal(res.body.status_text, 'In QA');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, 'open');

          _id = res.body._id;
          done();
        });
    });

    test('Required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .type('form')
        .send({
          method: 'post',
          issue_title: 'Fix error in posting data',
          issue_text: 'When we post data it has an error.',
          created_by: 'Joe',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Fix error in posting data');
          assert.equal(
            res.body.issue_text,
            'When we post data it has an error.'
          );
          assert.equal(res.body.created_by, 'Joe');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.equal(res.body.open, true);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          done();
        });
    });

    test('Missing required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .type('form')
        .send({
          method: 'post',
          assigned_to: 'Joe',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"required field(s) missing"}');
          done();
        });
    });
  });

  suite('GET /api/issues/{project} => array of issue objects', function () {
    test('no filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');

          done();
        });
    });

    test('one filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .query({ issue_title: 'Fix error in posting data' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].issue_title, 'Fix error in posting data');
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          done();
        });
    });

    test('multiple filters', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .query({ issue_title: 'Fix error in posting data', created_by: 'John' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].issue_title, 'Fix error in posting data');
          assert.equal(res.body[0].created_by, 'John');
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => success or error objects', function () {
    test('update one field', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({ _id: _id, assigned_to: 'Kevin' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            `{"result":"successfully updated","_id":"${_id}"}`
          );
          done();
        });
    });

    test('update multiple fields', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({ _id: _id, assigned_to: 'Kevin', status_text: 'Test' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            `{"result":"successfully updated","_id":"${_id}"}`
          );
          done();
        });
    });

    test('update with missing id', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({ assigned_to: 'Kevin', status_text: 'Test' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"missing _id"}');
          done();
        });
    });

    test('update with no fields filled out', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({ _id: _id })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            `{"error":"no update field(s) sent","_id":"${_id}"}`
          );
          done();
        });
    });

    test('update with invalid id', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({ _id: '3dw3', assigned_to: 'Kevin', status_text: 'Test' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, `{"error":"could not update","_id":"3dw3"}`);
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project} => updated issue objects', function () {
    test('delete with invalid id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({ _id: '3asd3' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, `{"error":"could not delete","_id":"3asd3"}`);
          done();
        });
    });

    test('delete with missing id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, `{"error":"missing _id"}`);
          done();
        });
    });

    test('delete issue', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({ _id: _id })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            `{"result":"successfully deleted","_id":"${_id}"}`
          );
          done();
        });
    });
  });
});
