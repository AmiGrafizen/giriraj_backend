import { mtModels } from "../db/index.js";

const createParty = async (data) => {
  return await mtModels?.MTParty?.create(data);
};

const getParties = async () => {
  return await mtModels?.MTParty.find();
};

const getPartyById = async (id) => {
  return await mtModels?.MTParty?.findById(id);
};

const getPartyByNameService = async (name) => {
  return await mtModels?.MTParty?.findOne({
    partyName: { $regex: new RegExp(`^${name}$`, "i") },
  });
};

const updateParty = async (id, data) => {
  return await mtModels?.MTParty.findByIdAndUpdate(id, data, { new: true });
};

const deleteParty = async (id) => {
  return await mtModels?.MTParty.findByIdAndDelete(id);
};

const createPurchase = async (data) => {
    return await mtModels?.MTPurchase?.create(data);
};

const getAllPurchases = async (filters = {}) => {
  const query = {};

  // Apply filters only if present
  if (filters.firm) query.firmName = { $regex: filters.firm, $options: "i" };
  if (filters.user) query.userName = { $regex: filters.user, $options: "i" };
  if (filters.paymentType) query.paymentType = filters.paymentType;

  if (filters.from && filters.to) {
    query.billDate = {
      $gte: new Date(filters.from),
      $lte: new Date(filters.to),
    };
  }

  if (filters.search) {
    query.$or = [
      { billNumber: { $regex: filters.search, $options: "i" } },
      { transaction: { $regex: filters.search, $options: "i" } },
      { "partyId.partyName": { $regex: filters.search, $options: "i" } },
    ];
  }

  // ✅ If no filters applied, query remains empty => fetch all sales
  const sales = await mtModels?.MTPurchase.find(query)
    .populate("partyId", "partyName")
    .sort({ createdAt: -1 });

  return sales;
};
const getPurchaseById = async (id) => {
  return await mtModels?.MTPurchase.findById(id).populate("partyId", "partyName").lean();
};

const updatePurchase = async (id, data) => {
  return await mtModels?.MTPurchase.findByIdAndUpdate(id, data, { new: true }).lean();
};

const deletePurchase = async (id) => {
  return await mtModels?.MTPurchase.findByIdAndDelete(id);
};

 const createSale = async (data) => {
    return await mtModels?.MTSale?.create(data);
};

const getAllSales = async (filters = {}) => {
  const query = {};

  // Apply filters only if present
  if (filters.firm) query.firmName = { $regex: filters.firm, $options: "i" };
  if (filters.user) query.userName = { $regex: filters.user, $options: "i" };
  if (filters.paymentType) query.paymentType = filters.paymentType;

  if (filters.from && filters.to) {
    query.billDate = {
      $gte: new Date(filters.from),
      $lte: new Date(filters.to),
    };
  }

  if (filters.search) {
    query.$or = [
      { billNumber: { $regex: filters.search, $options: "i" } },
      { transaction: { $regex: filters.search, $options: "i" } },
      { "partyId.partyName": { $regex: filters.search, $options: "i" } },
    ];
  }

  // ✅ If no filters applied, query remains empty => fetch all sales
  const sales = await mtModels?.MTSale.find(query)
    .populate("partyId", "partyName")
    .sort({ createdAt: -1 });

  return sales;
};


const getSaleById = async (id) => {
  return await mtModels?.MTSale.findById(id).populate("partyId", "partyName").lean();
};

const updateSale = async (id, data) => {
  return await mtModels?.MTSale.findByIdAndUpdate(id, data, { new: true }).lean();
};

const deleteSale = async (id) => {
  return await mtModels?.MTSale.findByIdAndDelete(id);
};

 const createItem = async (data) => {
    return await mtModels?.MTItem?.create(data);

};

const getAllItems = async (filter = {}) => {
  return await mtModels?.MTItem?.find(filter).sort({ createdAt: -1 });
};

const getItemById = async (id) => {
  return await mtModels?.MTItem?.findById(id);
};

const updateItem = async (id, data) => {
  return await mtModels?.MTItem?.findByIdAndUpdate(id, data, { new: true });
};

const deleteItem = async (id) => {
  return await mtModels?.MTItem?.findByIdAndDelete(id);
};

 const getSalePurchaseByPartyService = async (startDate, endDate) => {
  const saleMatch = {};
  const purchaseMatch = {};

  // Date filters
  if (startDate && endDate) {
    saleMatch.invoiceDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
    purchaseMatch.billDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // --- Aggregate Sales ---
  const saleAgg = await mtModels?.MTSale.aggregate([
    { $match: saleMatch },
    {
      $group: {
        _id: "$customerId",
        totalSaleAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  // --- Aggregate Purchases ---
  const purchaseAgg = await mtModels?.MTPurchase.aggregate([
    { $match: purchaseMatch },
    {
      $group: {
        _id: "$partyId",
        totalPurchaseAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  // Combine sale + purchase
  const combinedMap = new Map();

  saleAgg.forEach((sale) => {
    const id = sale._id?.toString();
    if (!id) return;
    combinedMap.set(id, {
      partyId: id,
      saleAmount: sale.totalSaleAmount,
      purchaseAmount: 0,
    });
  });

  purchaseAgg.forEach((purchase) => {
    const id = purchase._id?.toString();
    if (!id) return;

    if (combinedMap.has(id)) {
      combinedMap.get(id).purchaseAmount = purchase.totalPurchaseAmount;
    } else {
      combinedMap.set(id, {
        partyId: id,
        saleAmount: 0,
        purchaseAmount: purchase.totalPurchaseAmount,
      });
    }
  });

  // Fetch party names
  const partyIds = Array.from(combinedMap.keys()).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const parties = await Party.find({ _id: { $in: partyIds } }, "partyName");

  const report = Array.from(combinedMap.values()).map((entry) => {
    const party = parties.find((p) => p._id.toString() === entry.partyId);
    return {
      partyName: party ? party.partyName : "Unknown Party",
      saleAmount: entry.saleAmount,
      purchaseAmount: entry.purchaseAmount,
    };
  });

  // Totals
  const totalSaleAmount = report.reduce((sum, r) => sum + r.saleAmount, 0);
  const totalPurchaseAmount = report.reduce(
    (sum, r) => sum + r.purchaseAmount,
    0
  );

  // Sort by party name
  report.sort((a, b) => a.partyName.localeCompare(b.partyName));

  return {
    report,
    totalSaleAmount,
    totalPurchaseAmount,
  };
};

const createInfo = async (data) => {
  return await mtModels?.MTInfo.create(data);
};

const getAllInfo = async () => {
  return await mtModels?.MTInfo.find().populate("userId", "name email");
};

const getInfoById = async (id) => {
  return await mtModels?.MTInfo.findById(id).populate("userId", "name email");
};

const updateInfo = async (id, data) => {
  return await mtModels?.MTInfo.findByIdAndUpdate(id, data, { new: true });
};

const deleteInfo = async (id) => {
  return await mtModels?.MTInfo.findByIdAndDelete(id);
};

const getInfoByUserId = async (userId) => {
  return await mtModels?.MTInfo.findOne({ userId }).populate("userId", "name email");
};

const createRole = async (data) => {
  return await mtModels?.MTRole?.create(data);
};

const getAllRoles = async () => {
  return await mtModels?.MTRole?.find();
};

const getRoleById = async (id) => {
  return await mtModels?.MTRole?.findById(id);
};

const updateRole = async (id, data) => {
  return await mtModels?.MTRole?.findByIdAndUpdate(id, data, { new: true });
};

const deleteRole = async (id) => {
  return await mtModels?.MTRole?.findByIdAndDelete(id);
};

const createRoleUser = async (data) => {
  const roleUser = await mtModels?.MTRoleUser?.create(data);
  return roleUser;
};

const getAllRoleUsers = async () => {
  return await mtModels?.MTRoleUser.find().populate("role", "role permission");
};

const getRoleUserById = async (id) => {
  return await mtModels?.MTRoleUser.findById(id).populate("role", "role permission");
};

const updateRoleUser = async (id, data) => {
  return await mtModels?.MTRoleUser.findByIdAndUpdate(id, data, { new: true }).populate(
    "role",
    "role permission"
  );
};

const deleteRoleUser = async (id) => {
  return await mtModels?.MTRoleUser.findByIdAndDelete(id);
};

const getRoleUsersByRole = async (roleId) => {
  return await mtModels?.MTRoleUser.find({ role: roleId }).populate("role", "role permission");
};

const createBranch = async (data) => {
  return await mtModels?.MTBranch.create(data);
};

const getAllBranches = async () => {
  return await mtModels?.MTBranch.find().populate("company", "firmName"); // fetch firm name from Info
};

const getBranchById = async (id) => {
  return await mtModels?.MTBranch.findById(id).populate("company", "firmName");
};

const updateBranch = async (id, data) => {
  return await mtModels?.MTBranch.findByIdAndUpdate(id, data, { new: true });
};

const deleteBranch = async (id) => {
  return await mtModels?.MTBranch.findByIdAndDelete(id);
};

const getBranchesByCompany = async (companyId) => {
  return await mtModels?.MTBranch.find({ company: companyId }).populate("company", "firmName");
};

const createTransfer = async (data) => {
  return await  mtModels?.MTStockTransfer?.create(data);
};

const getTransfers = async (filters = {}) => {
  const query = {};

  console.log("🧾 Received filters:", filters);

  // 🏢 Filter by Company
  if (filters.company && filters.company !== "null" && filters.company !== "undefined") {
    query.companyId = filters.company;
  }

  // 🏬 Filter by Branch (either from or to)
  if (filters.branch && filters.branch !== "null" && filters.branch !== "undefined") {
    query.$or = [{ fromBranchId: filters.branch }, { toBranchId: filters.branch }];
  }

  // 📅 Filter by transferDate (correct field from your DB)
  if (filters.from && filters.to && filters.from !== "null" && filters.to !== "null") {
    query.transferDate = {
      $gte: new Date(filters.from),
      $lte: new Date(filters.to),
    };
  }

  // 🔍 Optional text search (on productName, model, etc.)
  if (filters.search && filters.search.trim() !== "") {
    query.$or = [
      { "items.productName": { $regex: filters.search, $options: "i" } },
      { "items.model": { $regex: filters.search, $options: "i" } },
      { "items.serialNo": { $regex: filters.search, $options: "i" } },
    ];
  }

  // 🧩 If no filters → query remains empty → fetch all transfers
  console.log("🔍 Final Mongo Query:", JSON.stringify(query, null, 2));

  const transfers = await mtModels?.MTStockTransfer?.find(query)
    .populate("companyId", "firmName name")
    .populate("fromBranchId", "name address")
    .populate("toBranchId", "name address")
    .sort({ createdAt: -1 });

  console.log("📦 Transfers found:", transfers.length);
  return transfers;
};

const getTransferById = async (id) => {
  return await mtModels?.MTStockTransfer?.findById(id)
    .populate("companyId", "firmName")
    .populate("fromBranchId", "branchName address")
    .populate("toBranchId", "branchName address");
};

const deleteTransfer = async (id) => {
  return await mtModels?.MTStockTransfer?.findByIdAndDelete(id);
};

const updateTransfer = async (id, data) => {
  return await mtModels?.MTStockTransfer?.findByIdAndUpdate(id, data, {
    new: true,
  })
    .populate("companyId", "firmName")
    .populate("fromBranchId", "branchName")
    .populate("toBranchId", "branchName");
};

 const getAvailableStocksService = async () => {
  const data = await mtModels?.MTPurchase.aggregate([
    { $unwind: "$items" },
    {
      $project: {
        itemName: "$items.itemName",
        serialNumbers: "$items.serialNumbers",
      },
    },
    { $unwind: "$serialNumbers" },
    {
      $group: {
        _id: "$itemName",
        stock: { $sum: 1 },
        serials: { $addToSet: "$serialNumbers" },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        stock: 1,
        serials: 1,
      },
    },
  ]);

  return data;
};

const getSerialsByProductService = async (productName) => {
  const product = await mtModels?.MTPurchase.aggregate([
    { $unwind: "$items" },
    { $match: { "items.itemName": productName } },
    {
      $project: {
        serialNumbers: "$items.serialNumbers",
      },
    },
  ]);

  const serials = product.flatMap((p) => p.serialNumbers || []);
  return [...new Set(serials)]; // remove duplicates
};

const createSalesParty = async (data) => {
  return await mtModels?.MTSalesParty(data);

};

const getSalesParties = async () => {
  return await mtModels?.MTSalesParty.find();
};

const getSalesPartyById = async (id) => {
  return await mtModels?.MTSalesParty.findById(id);
};

const getSalesPartyByNameService = async (name) => {
  return await mtModels?.MTSalesParty.findOne({
    partyName: { $regex: new RegExp(`^${name}$`, "i") },
  });
};

const updateSalesParty = async (id, data) => {
  return await mtModels?.MTSalesParty.findByIdAndUpdate(id, data, { new: true });
};

const deleteSalesParty = async (id) => {
  return await mtModels?.MTSalesParty.findByIdAndDelete(id);
};


export default { createParty, getParties, getPartyById, getPartyByNameService, updateParty, deleteParty, createPurchase, getAllPurchases, getPurchaseById, updatePurchase, deletePurchase,
    createSale, getAllSales, getSaleById, updateSale, deleteSale, createItem, getAllItems, getItemById, updateItem, deleteItem, getSalePurchaseByPartyService, createInfo, getAllInfo, getInfoById,
    getInfoByUserId, updateInfo, deleteInfo, createRole, getAllRoles, getRoleById, updateRole, deleteRole, createRoleUser, getAllRoleUsers, getRoleUserById,
    updateRoleUser, deleteRoleUser, getRoleUsersByRole, createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, getBranchesByCompany, createTransfer, getTransferById, getTransfers,
    deleteTransfer, updateTransfer, getAvailableStocksService, getSerialsByProductService, createSalesParty, getSalesParties, getSalesPartyById,
    updateSalesParty, deleteSalesParty, getSalesPartyByNameService,
}