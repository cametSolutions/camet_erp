import express from 'express'
const router = express.Router();
import { adminLogin ,logout,getAdminData,getPrimaryUsers,
    handlePrimaryApprove,handlePrimaryBlock,handleSecondaryBlock,
    getOrganizationsAdmin,getOrganizations,fetchSecondaryUsers,
    handleSubscription,handleSms,handleWhatsApp,handleOrganizationApprove,handlePrimaryDelete,
    handleCompanyDelete,  getPrimaryUserProfileById,
  updatePrimaryUserStatus,
  updateOrganizationStatus,
  updateSecondaryUserStatus,updateUserCapacity ,
    syncIndexes} from '../controllers/adminController.js';
import { authAdmin } from '../middlewares/authAdmin.js';

router.post('/adminLogin',adminLogin);
router.post('/logout',logout);
router.get('/getAdminData',authAdmin,getAdminData);
router.get('/getPrimaryUsers',authAdmin,getPrimaryUsers);
router.post('/handlePrimaryApprove/:id',authAdmin,handlePrimaryApprove);
router.delete('/handlePrimaryDelete/:id',authAdmin,handlePrimaryDelete);
router.post('/handlePrimaryBlock/:id',authAdmin,handlePrimaryBlock);
router.post('/handleSecondaryBlock/:id',authAdmin,handleSecondaryBlock);
router.get('/getOrganizationsAdmin',authAdmin,getOrganizationsAdmin);
router.get('/getOrganizations',authAdmin,getOrganizations);
router.get('/fetchSecondaryUsers',authAdmin,fetchSecondaryUsers);
router.post('/handleSubscription/:id',authAdmin,handleSubscription);
router.post('/handleSms/:id',authAdmin,handleSms);
router.post('/handleWhatsApp/:id',authAdmin,handleWhatsApp);
router.post('/handleOrganizationApprove/:id',authAdmin,handleOrganizationApprove);
router.delete('/deleteCompanyData/:cmp_id',authAdmin,handleCompanyDelete);
router.post('/syncIndexes',syncIndexes);


router.get('/getPrimaryUserProfileById/:userId',authAdmin, getPrimaryUserProfileById);

// Update status routes - note the correct paths matching frontend
router.patch('/updatePrimaryUserStatus/:userId', authAdmin,updatePrimaryUserStatus);
router.patch('/updateOrganizationStatus/:organizationId',authAdmin, updateOrganizationStatus);
router.patch('/updateSecondaryUserStatus/:secondaryUserId',authAdmin, updateSecondaryUserStatus);
router.patch('/updateUserCapacity/:userId', authAdmin, updateUserCapacity);
export default router