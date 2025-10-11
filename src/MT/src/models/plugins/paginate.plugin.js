// const paginate = (schema) => {
//   /**
//    * @typedef {Object} QueryResult
//    * @property {Document[]} results - Results found
//    * @property {number} page - Current page
//    * @property {number} limit - Maximum number of results per page
//    * @property {number} totalPages - Total number of pages
//    * @property {number} totalResults - Total number of documents
//    */
//   /**
//    * Query for documents with pagination
//    * @param {Object} [filter] - Mongo filter
//    * @param {Object} [options] - Query options
//    * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
//    * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
//    * @param {number} [options.limit] - Maximum number of results per page (default = 10)
//    * @param {number} [options.page] - Current page (default = 1)
//    * @returns {Promise<QueryResult>}
//    */
//   schema.statics.paginate = async function (filter, options, searchTerm) {
//     let sort = '';
//     if (options.sortBy) {
//       const sortingCriteria = [];
//       options.sortBy.split(',').forEach((sortOption) => {
//         const [key, order] = sortOption.split(':');
//         sortingCriteria.push((order === 'desc' ? '-' : '') + key);
//       });
//       sort = sortingCriteria.join(' ');
//     } else {
//       sort = '-createdAt';
//     }

//     const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
//     const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
//     const skip = (page - 1) * limit;

//     const searchFilter = searchTerm ? {
//       $or: [
//         { phoneNumber: { $regex: searchTerm, $options: 'i' } },
//         { email: { $regex: searchTerm, $options: 'i' } },
//         { 'user_details.firstName': { $regex: searchTerm, $options: 'i' } },
//         { 'user_details.lastName': { $regex: searchTerm, $options: 'i' } },
//         { 'user_details.businessName': { $regex: searchTerm, $options: 'i' } },
//       ]
//     } : {};

//     const combinedFilter = { ...filter, ...searchFilter };

//     const countPromise = this.countDocuments(combinedFilter).exec();
//     let docsPromise = this.find(combinedFilter).sort(sort).skip(skip).limit(limit);

//     if (options.populate) {
//       options.populate.split(',').forEach((populateOption) => {
//         docsPromise = docsPromise.populate(
//           populateOption
//             .split('.')
//             .reverse()
//             .reduce((a, b) => ({ path: b, populate: a })),
//         );
//       });
//     }

//     docsPromise = docsPromise.exec();

//     return Promise.all([countPromise, docsPromise]).then((values) => {
//       const [totalResults, results] = values;
//       const totalPages = Math.ceil(totalResults / limit);
//       const result = {
//         results,
//         page,
//         limit,
//         totalPages,
//         totalResults,
//       };
//       return Promise.resolve(result);
//     });
//   };
// };

const paginate = (schema) => {

  // Sort by 'createdAt' in descending order
// const options = {
//   limit: 10,
//   page: 2,
//   sortBy: 'createdAt:desc', 
// };
// const filter = { status: 'active', userId: someUserId };

  schema.statics.paginate = async function (filter = {}, options = {}) {
    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    let sort = {};
    if (options.sortBy) {
      const sortCriteria = options.sortBy.split(',').reduce((acc, sortOption) => {
        const [key, order] = sortOption.split(':');
        acc[key] = order === 'desc' ? -1 : 1; 
        return acc;
      }, {});
      sort = sortCriteria;
    }

    const countPromise = this.countDocuments(filter).exec();
    const docsPromise = this.find(filter).skip(skip).limit(limit).sort(sort).exec();

    return Promise.all([countPromise, docsPromise]).then(([totalResults, results]) => {
      const totalPages = Math.ceil(totalResults / limit);
      return {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
    });
  };
};

export default paginate;


