/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


  /**
  * @api {post} /user Create user
  * @apiName Create User
  * @apiGroup User
  * @apiVersion 0.0.1
  *
  * @apiUse UserParams
  *
  * @apiUse UserSuccessResponse
  *
  * @apiUse ValidationErrorExample
  */
  create(req, res) {
    let data = req.body;
    User.create(data).then((user) => {
      if (user.role === 'admin') NotificationService.sendWelcomeEmail(data);
      return ResponseService.json(
        200, res, 'User created successfully', user
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, User, res);
    });
  },

  /**
  * @api {put} /user/:id Update user
  * @apiName Update User
  * @apiGroup User
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id             user's id
  *
  * @apiUse UserParams
  *
  * @apiUse UserSuccessResponse
  *
  * @apiUse ValidationErrorExample
  * @apiUse NotFoundExample
  */
  update(req, res) {
    let data = req.body;
    User.update({
      id: req.param('id'),
    }, data).then((updatedUser) => {
      if (!updatedUser.length) {
        return ResponseService.json(404, res, 'User not found');
      }

      return ResponseService.json(
        200, res, 'Updated user successfully', updatedUser[0]
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, User, res);
    });
  },

  /**
  * @api {get} /user/:id Fetch user
  * @apiName Fetch User
  * @apiGroup User
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id      user's id
  *
  * @apiUse UserSuccessResponse
  *
  * @apiUse NotFoundExample
  */
  view(req, res) {
    QueryService.findOne(User, req).then(user => {
      if (!user) {
        return ResponseService.json(404, res, 'User not found');
      }

      return ResponseService.json(
        200, res, 'User retrieved successfully', user
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, User, res);
    });
  },

  /**
  * @api {get} /user Fetch all users
  * @apiName Fetch All User
  * @apiGroup User
  * @apiVersion 0.0.1
  *
  * @apiUse UserSuccessResponse
  * @apiUse NotFoundExample
  */
  list(req, res) {
    var conditions = { isDeleted: false };
    QueryService.find(User, req, conditions).then(records => {
      return ResponseService.json(
        200,
        res,
        'Users retrieved successfully',
        records.data,
        records.meta
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, User, res);
    });
  },

  /**
  * @api {delete} /user/:id Remove user
  * @apiName Remove User
  * @apiGroup User
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id      employee's id
  *
  * @apiUse UserParams
  *
  * @apiSuccessExample Success-Response
  * HTTP/1.1 200 OK
  * {
  *    "response": {
  *       "message": "User removed successfully",
  *       "data": {
  *          "isDeleted": "true",
  *          "createdAt": "2015-01-07T09:43:40.100Z",
  *          "updatedAt": "2015-01-07T09:43:40.100Z",
  *          "id": "54acffcc902ab22e59bc507a"
  *       }
  *    }
  * }
  *
  * @apiUse NotFoundExample
  */
  delete(req, res) {
    let id = req.params.id;
    User.update(
      { id: id, isDeleted: false },
      { isDeleted: true }
    ).then((deletedUser) => {
      if (!deletedUser.length) {
        return ResponseService.json(404, res, 'User not found');
      }

      return ResponseService.json(
        200, res, 'User removed successfully', deletedUser[0]
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, User, res);
    });
  },
};
