import branchModel from "../models/branch.model.js";
import infoModel from "../models/info.model.js";
import partyModel from "../models/party.model.js";
import purchaseModel from "../models/purchase.model.js";
import roleModel from "../models/role.model.js";
import roleUserModel from "../models/roleUser.model.js";
import saleModel from "../models/sale.model.js";
import stockTransferModel from "../models/stockTransfer.model.js";

const createParty = async (data) => {
  const party = new partyModel(data);
  return await party.save();
};

const getParties = async () => {
  return await partyModel.find();
};

const getPartyById = async (id) => {
  return await partyModel.findById(id);
};

const getPartyByNameService = async (name) => {
  return await partyModel.findOne({
    partyName: { $regex: new RegExp(`^${name}$`, "i") },
  });
};

const updateParty = async (id, data) => {
  return await partyModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteParty = async (id) => {
  return await partyModel.findByIdAndDelete(id);
};

const createPurchase = async (data) => {
  const purchase = new purchaseModel(data);
  return await purchase.save();
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
  const sales = await purchaseModel.find(query)
    .populate("partyId", "partyName")
    .sort({ createdAt: -1 });

  return sales;
};
const getPurchaseById = async (id) => {
  return await purchaseModel.findById(id).populate("partyId", "partyName").lean();
};

const updatePurchase = async (id, data) => {
  return await purchaseModel.findByIdAndUpdate(id, data, { new: true }).lean();
};

const deletePurchase = async (id) => {
  return await purchaseModel.findByIdAndDelete(id);
};

 const createSale = async (data) => {
  const sale = new saleModel(data);
  return await sale.save();
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
  const sales = await saleModel.find(query)
    .populate("partyId", "partyName")
    .sort({ createdAt: -1 });

  return sales;
};


const getSaleById = async (id) => {
  return await saleModel.findById(id).populate("partyId", "partyName").lean();
};

const updateSale = async (id, data) => {
  return await saleModel.findByIdAndUpdate(id, data, { new: true }).lean();
};

const deleteSale = async (id) => {
  return await saleModel.findByIdAndDelete(id);
};

 const createItem = async (data) => {
  const item = new itemModel(data);
  return await item.save();
};

const getAllItems = async (filter = {}) => {
  return await itemModel.find(filter).sort({ createdAt: -1 });
};

const getItemById = async (id) => {
  return await itemModel.findById(id);
};

const updateItem = async (id, data) => {
  return await itemModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteItem = async (id) => {
  return await itemModel.findByIdAndDelete(id);
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
  const saleAgg = await saleModel.aggregate([
    { $match: saleMatch },
    {
      $group: {
        _id: "$customerId",
        totalSaleAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  // --- Aggregate Purchases ---
  const purchaseAgg = await purchaseModel.aggregate([
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
  const info = await infoModel.create(data);
  return info;
};

const getAllInfo = async () => {
  return await infoModel.find().populate("userId", "name email");
};

const getInfoById = async (id) => {
  return await infoModel.findById(id).populate("userId", "name email");
};

const updateInfo = async (id, data) => {
  return await infoModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteInfo = async (id) => {
  return await infoModel.findByIdAndDelete(id);
};

const getInfoByUserId = async (userId) => {
  return await infoModel.findOne({ userId }).populate("userId", "name email");
};

const createRole = async (data) => {
  const role = await roleModel.create(data);
  return role;
};

const getAllRoles = async () => {
  return await roleModel.find();
};

const getRoleById = async (id) => {
  return await roleModel.findById(id);
};

const updateRole = async (id, data) => {
  return await roleModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteRole = async (id) => {
  return await roleModel.findByIdAndDelete(id);
};

const createRoleUser = async (data) => {
  const roleUser = await roleUserModel.create(data);
  return roleUser;
};

const getAllRoleUsers = async () => {
  return await roleUserModel.find().populate("role", "role permission");
};

const getRoleUserById = async (id) => {
  return await roleUserModel.findById(id).populate("role", "role permission");
};

const updateRoleUser = async (id, data) => {
  return await roleUserModel.findByIdAndUpdate(id, data, { new: true }).populate(
    "role",
    "role permission"
  );
};

const deleteRoleUser = async (id) => {
  return await roleUserModel.findByIdAndDelete(id);
};

const getRoleUsersByRole = async (roleId) => {
  return await roleUserModel.find({ role: roleId }).populate("role", "role permission");
};

const createBranch = async (data) => {
  return await branchModel.create(data);
};

const getAllBranches = async () => {
  return await branchModel.find().populate("company", "firmName"); // fetch firm name from Info
};

const getBranchById = async (id) => {
  return await branchModel.findById(id).populate("company", "firmName");
};

const updateBranch = async (id, data) => {
  return await branchModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteBranch = async (id) => {
  return await branchModel.findByIdAndDelete(id);
};

const getBranchesByCompany = async (companyId) => {
  return await branchModel.find({ company: companyId }).populate("company", "firmName");
};

const createTransfer = async (data) => {
  const transfer = new stockTransferModel(data);
  return await transfer.save();
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

  const transfers = await stockTransferModel.find(query)
    .populate("companyId", "firmName name")
    .populate("fromBranchId", "name address")
    .populate("toBranchId", "name address")
    .sort({ createdAt: -1 });

  console.log("📦 Transfers found:", transfers.length);
  return transfers;
};

const getTransferById = async (id) => {
  return await stockTransferModel.findById(id)
    .populate("companyId", "firmName")
    .populate("fromBranchId", "branchName address")
    .populate("toBranchId", "branchName address");
};

const deleteTransfer = async (id) => {
  return await stockTransferModel.findByIdAndDelete(id);
};

const updateTransfer = async (id, data) => {
  return await stockTransferModel.findByIdAndUpdate(id, data, {
    new: true,
  })
    .populate("companyId", "firmName")
    .populate("fromBranchId", "branchName")
    .populate("toBranchId", "branchName");
};


export default { createParty, getParties, getPartyById, getPartyByNameService, updateParty, deleteParty, createPurchase, getAllPurchases, getPurchaseById, updatePurchase, deletePurchase,
    createSale, getAllSales, getSaleById, updateSale, deleteSale, createItem, getAllItems, getItemById, updateItem, deleteItem, getSalePurchaseByPartyService, createInfo, getAllInfo, getInfoById,
    getInfoByUserId, updateInfo, deleteInfo, createRole, getAllRoles, getRoleById, updateRole, deleteRole, createRoleUser, getAllRoleUsers, getRoleUserById,
    updateRoleUser, deleteRoleUser, getRoleUsersByRole, createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, getBranchesByCompany, createTransfer, getTransferById, getTransfers,
    deleteTransfer, updateTransfer,
}