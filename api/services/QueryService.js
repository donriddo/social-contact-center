module.exports = {
  findOne(model, req) {
    let query = model.findOne({ id: req.params.id, isDeleted: false });
    if (req.query.populate) {
      if (_.isArray(req.query.populate)) {
        _(req.query.populate).forEach(populate => {
          if (populate in model.populateables)
            query = query.populate(populate, { isDeleted: false });
        });
      } else {
        if (req.query.populate in model.populateables)
          query = query.populate(req.query.populate, { isDeleted: false });
      }
    }

    return query;
  },

  find(model, req, conditions) {
    let populateData = [];
    let sortBy = 'createdAt';
    let sortDir = 'DESC';
    if (req.query.populate) {
      if (_.isArray(req.query.populate)) {
        _(req.query.populate).forEach((modelName) => {
          if (modelName in model.populateables) {
            populateData.push({
              name: modelName,
              query: {
                isDeleted: false,
              },
            });
          }
        });
      } else {
        if (req.query.populate in model.populateables) {
          populateData.push({
            name: req.query.populate,
            query: {
              isDeleted: false,
            },
          });
        }
      }
    }

    if (req.query.sortBy) {
      sortBy = req.query.sortBy;
    }

    if (req.query.sortDir) {
      sortDir = req.query.sortDir;
    }

    let sort = sortBy + ' ' + sortDir.toUpperCase();
    let perPage = req.query.perPage;
    let currentPage = req.query.page;
    return _pager.paginate(model, conditions, currentPage, perPage, populateData, sort);
  },
};
