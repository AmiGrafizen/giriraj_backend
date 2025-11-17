import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';

const router = Router();

router.route("/party")
.post(adminController.createParty)
.get(adminController.getAllParties);

router.route("/party/:id")
.get(adminController.getPartyById)
.put(adminController.updateParty)
.delete(adminController.deleteParty);

router.get("/party-by-name/:name", adminController.getPartyByName);

router.route("/purchase")
.post(adminController.createPurchase)
.get(adminController.getAllPurchases);

router.route("/purchase/:id")
.get(adminController.getPurchaseById)
.put(adminController.updatePurchase)
.delete(adminController.deletePurchase);

router.route("/sale")
.post(adminController.createSale)
.get(adminController.getAllSales);

router.route("/sale/:id")
.get(adminController.getSaleById)
.put(adminController.updateSale)
.delete(adminController.deleteSale);

router.route("/item")
.post(adminController.createItem)
.get(adminController.getAllItems);

router.route("/item/:id")
.get(adminController.getItemById)
.put(adminController.updateItem)
.delete(adminController.deleteItem);

router.route("/info")
.post(adminController.createInfo)
.get(adminController.getAllInfo);

router.route("/info/:id")
.get(adminController.getInfoById)
.put(adminController.updateInfo)
.delete(adminController.deleteInfo);

router.get("/info/user/:userId", adminController.getInfoByUserId);

router.route("/role")
.post(adminController.createRole)
.get(adminController.getAllRoles);

router.route("/role/:id")
.get(adminController.getRoleById)
.put(adminController.updateRole)
.delete(adminController.deleteRole);

router.route("/role-user")
.post(adminController.createRoleUser)
.get(adminController.getAllRoleUsers);

router.route("/role-user/:id")
.get(adminController.getRoleUserById)
.put(adminController.updateRoleUser)
.delete(adminController.deleteRoleUser);

router.get("/role-user/role/:roleId", adminController.getRoleUsersByRole);

router.get("/sale-purchase-by-party", adminController.getSalePurchaseByParty);

router.route("/branch")
.post(adminController.createBranch)
.get(adminController.getAllBranches);

router.route("/branch/:id")
.get(adminController.getBranchById)
.put(adminController.updateBranch)
.delete(adminController.deleteBranch);

router.get("/branch/company/:companyId", adminController.getBranchesByCompany);

router.route("/stock-transfer")
.post(adminController.createTransfer)
.get(adminController.getTransfers);

router.route("/stock-transfer/:id")
.get(adminController.getTransferById)
.put(adminController.updateBranch)
.delete(adminController.deleteTransfer);

router.get("/available-stocks", adminController.getAvailableStocks);

router.get("/serials/:productName", adminController.getSerialsByProduct);

router.route("/sales-party")
.post(adminController.createSalesParty)
.get(adminController.getAllSaleParties);

router.route("/sales-party/:id")
.get(adminController.getSalesPartyById)
.put(adminController.updateSalesParty)
.delete(adminController.deleteSalesParty);

router.get("/sales-party-by-name/:name", adminController.getSalesPartyByName);

export default router;
