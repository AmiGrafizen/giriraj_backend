const networkPaginate = (schema) => {
  schema.statics.networkPaginate = async function (filter, options, searchTerm) {
    let sort = {};
    if (options.sortBy) {
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sort[key] = order === 'desc' ? -1 : 1;
      });
    } else {
      sort = { createdAt: -1 };
    }

    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    const matchStage = { $match: filter };

    if (searchTerm) {
      matchStage.$match.$or = [
        { 'actionFrom.user_details.firstName': { $regex: searchTerm, $options: 'i' } },
        { 'actionFrom.user_details.lastName': { $regex: searchTerm, $options: 'i' } },
        { 'actionTo.user_details.firstName': { $regex: searchTerm, $options: 'i' } },
        { 'actionTo.user_details.lastName': { $regex: searchTerm, $options: 'i' } },
        { actionType: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const aggregatePipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'actionFrom',
          foreignField: '_id',
          as: 'actionFromDetails',
        },
      },
      { $unwind: '$actionFromDetails' },
      {
        $lookup: {
          from: 'users',
          localField: 'actionTo',
          foreignField: '_id',
          as: 'actionToDetails',
        },
      },
      { $unwind: '$actionToDetails' },
      {
        $project: {
          actionFrom: {
            _id: '$actionFromDetails._id',
            user_details: '$actionFromDetails.user_details',
          },
          actionTo: {
            _id: '$actionToDetails._id',
            user_details: '$actionToDetails.user_details',
          },
          actionType: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      matchStage,
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ];

    const countPromise = this.aggregate([...aggregatePipeline.slice(0, -2), { $count: 'totalResults' }]);

    const docsPromise = this.aggregate(aggregatePipeline);

    const [countResult, docsResult] = await Promise.all([countPromise, docsPromise]);
    const totalResults = countResult.length ? countResult[0].totalResults : 0;
    const totalPages = Math.ceil(totalResults / limit);
    const results = docsResult;

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
};

export default networkPaginate;
