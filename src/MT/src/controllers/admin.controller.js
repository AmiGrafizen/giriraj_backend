import adminService from "../services/admin.service.js";
import { sendSuccessResponse } from "../utils/ApiMessage.js";
import httpStatus from "http-status";

const createParty = async (req, res) => {
  try {
    const party = await adminService.createParty(req.body);
    return sendSuccessResponse(res, "create", party);
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

const getAllParties = async (req, res) => {
  try {
    const parties = await adminService.getParties();
    return sendSuccessResponse(res, "get", parties);
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

const getPartyById = async (req, res) => {
  try {
    const party = await adminService.getPartyById(req.params.id);
    if (!party)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Party not found" });

    return sendSuccessResponse(res, "get", party);
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

const getPartyByName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: "Party name is required",
      });
    }

    const party = await adminService.getPartyByNameService(name);
    if (!party) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: "Party not found",
      });
    }

    return sendSuccessResponse(res, "get", party);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to fetch party",
    });
  }
};


const updateParty = async (req, res) => {
  try {
    const updated = await adminService.updateParty(req.params.id, req.body);
    if (!updated)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Party not found" });

    return sendSuccessResponse(res, "update", updated);
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

const deleteParty = async (req, res) => {
  try {
    const deleted = await adminService.deleteParty(req.params.id);
    if (!deleted)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Party not found" });

    return sendSuccessResponse(res, "delete", null);
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

const createPurchase = async (req, res) => {
  try {
    const purchase = await adminService.createPurchase(req.body);
    return sendSuccessResponse(res, "create", purchase);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const filters = req.query;
    const sales = await adminService.getAllPurchases(filters);
    res.status(200).json(sales);
  } catch (err) {
    console.error("❌ Error fetching sales:", err);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await adminService.getPurchaseById(req.params.id);
    if (!purchase)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Purchase not found" });
    return sendSuccessResponse(res, "get", purchase);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const updated = await adminService.updatePurchase(req.params.id, req.body);
    if (!updated)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Purchase not found" });
    return sendSuccessResponse(res, "update", updated);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const deleted = await adminService.deletePurchase(req.params.id);
    if (!deleted)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Purchase not found" });
    return sendSuccessResponse(res, "delete", null);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const createSale = async (req, res) => {
  try {
    const sale = await adminService.createSale(req.body);
    return sendSuccessResponse(res, "create", sale);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getAllSales = async (req, res) => {
  try {
    const filters = req.query;
    const sales = await adminService.getAllSales(filters);
    res.status(200).json(sales);
  } catch (err) {
    console.error("❌ Error fetching sales:", err);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await adminService.getSaleById(req.params.id);
    if (!sale)
      return res.status(httpStatus.NOT_FOUND).json({ error: "Sale not found" });

    return sendSuccessResponse(res, "get", sale);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const updated = await adminService.updateSale(req.params.id, req.body);
    if (!updated)
      return res.status(httpStatus.NOT_FOUND).json({ error: "Sale not found" });

    return sendSuccessResponse(res, "update", updated);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const deleted = await adminService.deleteSale(req.params.id);
    if (!deleted)
      return res.status(httpStatus.NOT_FOUND).json({ error: "Sale not found" });

    return sendSuccessResponse(res, "delete", null);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const createItem = async (req, res) => {
  try {
    const item = await adminService.createItem(req.body);
    return sendSuccessResponse(res, "create", item);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

// ✅ Get All Items
const getAllItems = async (req, res) => {
  try {
    const items = await adminService.getAllItems();
    return sendSuccessResponse(res, "get", items);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// ✅ Get Item by ID
const getItemById = async (req, res) => {
  try {
    const item = await adminService.getItemById(req.params.id);
    if (!item)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Item not found" });

    return sendSuccessResponse(res, "get", item);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

// ✅ Get Item by Name
const getItemByName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: "Item name is required",
      });
    }

    const item = await adminService.getItemByName(name);
    if (!item) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: "Item not found",
      });
    }

    return sendSuccessResponse(res, "get", item);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to fetch item",
    });
  }
};

// ✅ Update Item
const updateItem = async (req, res) => {
  try {
    const updated = await adminService.updateItem(req.params.id, req.body);
    if (!updated)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Item not found" });

    return sendSuccessResponse(res, "update", updated);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const deleted = await adminService.deleteItem(req.params.id);
    if (!deleted)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Item not found" });

    return sendSuccessResponse(res, "delete", null);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getSalePurchaseByParty = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await adminService.getSalePurchaseByPartyService(startDate, endDate);

    return sendSuccessResponse(res, "get", data);
  } catch (error) {
    console.error("Error generating report:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to generate report" });
  }
};

const createInfo = async (req, res) => {
  try {
    const info = await adminService.createInfo(req.body);
    return sendSuccessResponse(res, "create", info);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getAllInfo = async (req, res) => {
  try {
    const infos = await adminService.getAllInfo();
    return sendSuccessResponse(res, "get", infos);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getInfoById = async (req, res) => {
  try {
    const info = await adminService.getInfoById(req.params.id);
    if (!info)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Info not found" });

    return sendSuccessResponse(res, "get", info);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getInfoByUserId = async (req, res) => {
  try {
    const info = await adminService.getInfoByUserId(req.params.userId);
    if (!info)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Info not found for this user" });

    return sendSuccessResponse(res, "get", info);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const updateInfo = async (req, res) => {
  try {
    const updated = await adminService.updateInfo(req.params.id, req.body);
    if (!updated)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Info not found" });

    return sendSuccessResponse(res, "update", updated);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteInfo = async (req, res) => {
  try {
    const deleted = await adminService.deleteInfo(req.params.id);
    if (!deleted)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Info not found" });

    return sendSuccessResponse(res, "delete", null);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const role = await adminService.createRole(req.body);
    return sendSuccessResponse(res, "create", role);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await adminService.getAllRoles();
    return sendSuccessResponse(res, "get", roles);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await adminService.getRoleById(req.params.id);
    if (!role)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Role not found" });

    return sendSuccessResponse(res, "get", role);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const updated = await adminService.updateRole(req.params.id, req.body);
    if (!updated)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Role not found" });

    return sendSuccessResponse(res, "update", updated);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const deleted = await adminService.deleteRole(req.params.id);
    if (!deleted)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Role not found" });

    return sendSuccessResponse(res, "delete", null);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const createRoleUser = async (req, res) => {
  try {
    const roleUser = await adminService.createRoleUser(req.body);
    return sendSuccessResponse(res, "create", roleUser);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getAllRoleUsers = async (req, res) => {
  try {
    const roleUsers = await adminService.getAllRoleUsers();
    return sendSuccessResponse(res, "get", roleUsers);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getRoleUserById = async (req, res) => {
  try {
    const roleUser = await adminService.getRoleUserById(req.params.id);
    if (!roleUser)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Role User not found" });

    return sendSuccessResponse(res, "get", roleUser);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getRoleUsersByRole = async (req, res) => {
  try {
    const roleUsers = await adminService.getRoleUsersByRole(req.params.roleId);
    return sendSuccessResponse(res, "get", roleUsers);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const updateRoleUser = async (req, res) => {
  try {
    const updated = await adminService.updateRoleUser(req.params.id, req.body);
    if (!updated)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Role User not found" });

    return sendSuccessResponse(res, "update", updated);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteRoleUser = async (req, res) => {
  try {
    const deleted = await adminService.deleteRoleUser(req.params.id);
    if (!deleted)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "Role User not found" });

    return sendSuccessResponse(res, "delete", null);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const createBranch = async (req, res) => {
  try {
    const branch = await adminService.createBranch(req.body);
    return sendSuccessResponse(res, "create", branch);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getAllBranches = async (req, res) => {
  try {
    const branches = await adminService.getAllBranches();
    return sendSuccessResponse(res, "get", branches);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getBranchById = async (req, res) => {
  try {
    const branch = await adminService.getBranchById(req.params.id);
    if (!branch)
      return res.status(httpStatus.NOT_FOUND).json({ message: "Branch not found" });
    return sendSuccessResponse(res, "get", branch);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const updateBranch = async (req, res) => {
  try {
    const updated = await adminService.updateBranch(req.params.id, req.body);
    if (!updated)
      return res.status(httpStatus.NOT_FOUND).json({ message: "Branch not found" });
    return sendSuccessResponse(res, "update", updated);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const deleted = await adminService.deleteBranch(req.params.id);
    if (!deleted)
      return res.status(httpStatus.NOT_FOUND).json({ message: "Branch not found" });
    return sendSuccessResponse(res, "delete", null);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
};

const getBranchesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const branches = await adminService.getBranchesByCompany(companyId);

    if (!branches || branches.length === 0) {
      return res.status(404).json({ message: "No branches found for this company" });
    }

    return sendSuccessResponse(res, "get", branches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createTransfer = async (req, res) => {
  try {
    const newTransfer = await adminService.createTransfer(req.body);
    res.status(201).json({ status: 201, message: "Transfer created", data: newTransfer });
  } catch (err) {
    console.error("Error creating transfer:", err);
    res.status(500).json({ status: 500, message: "Failed to create transfer" });
  }
};

const getTransfers = async (req, res) => {
try {
    const { company, branch, from, to, search } = req.query;

    const filters = {};
    if (company) filters.company = company;
    if (branch) filters.branch = branch;
    if (from && to) {
      filters.from = from;
      filters.to = to;
    }
    if (search) filters.search = search;

    const transfers = await adminService.getTransfers(filters);

    res.status(200).json({ success: true, data: transfers });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transfers" });
  }
};

const getTransferById = async (req, res) => {
  try {
    const transfer = await adminService.getTransferById(req.params.id);
    if (!transfer) return res.status(404).json({ status: 404, message: "Not found" });
    res.status(200).json({ status: 200, data: transfer });
  } catch (err) {
    console.error("Error fetching transfer:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch transfer" });
  }
};

const deleteTransfer = async (req, res) => {
  try {
    await adminService.deleteTransfer(req.params.id);
    res.status(200).json({ status: 200, message: "Transfer deleted" });
  } catch (err) {
    console.error("Error deleting transfer:", err);
    res.status(500).json({ status: 500, message: "Failed to delete transfer" });
  }
};

const updateTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await adminService.updateTransfer(id, req.body);
    if (!updated) {
      return res.status(404).json({ status: 404, message: "Transfer not found" });
    }
    res.status(200).json({
      status: 200,
      message: "Transfer updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updating transfer:", err);
    res.status(500).json({ status: 500, message: "Failed to update transfer" });
  }
};

export default {
  createParty, getPartyById, getPartyByName, updateParty, deleteParty, getAllParties, createPurchase, getAllPurchases, getPurchaseById, updatePurchase, deletePurchase,
  createSale, getAllSales, getSaleById, updateSale, deleteSale, createItem, getAllItems, getItemById, updateItem, deleteItem, getSalePurchaseByParty, createInfo, getAllInfo, getInfoById,
  getInfoByUserId, updateInfo, deleteInfo, createRole, getAllRoles, getRoleById, updateRole, deleteRole, createRoleUser, getAllRoleUsers, getRoleUserById, getRoleUsersByRole, updateRoleUser,
  deleteRoleUser, createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, getBranchesByCompany, createTransfer, getTransferById, getTransfers, deleteTransfer, updateTransfer,
}