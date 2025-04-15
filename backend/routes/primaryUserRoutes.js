import express from 'express';
const router = express.Router();
import { authPrimary } from '../middlewares/authPrimaryUsers.js';
import { registerPrimaryUser,login,
  addSecUsers,fetchSecondaryUsers,
  sendOtp,submitOtp,resetPassword,
   getSecUserDetails,
  editSecUSer,
  fetchGodownsAndPriceLevels,
  addSecondaryConfigurations,
  fetchConfigurationCurrentNumber} from '../controllers/primaryUserController.js';

import { primaryIsBlocked } from '../middlewares/isBlocked.js';
import { companyAuthentication } from '../middlewares/authCompany.js';


router.post('/register', registerPrimaryUser);
router.post('/login', login);
router.post('/addSecUsers', authPrimary,primaryIsBlocked,addSecUsers);
router.get('/fetchSecondaryUsers', authPrimary,primaryIsBlocked,fetchSecondaryUsers);
router.post('/sendOtp',sendOtp)
router.post('/submitOtp',submitOtp)
router.post('/resetPassword',resetPassword)
router.get('/getSecUserDetails/:id',authPrimary,primaryIsBlocked,getSecUserDetails)
router.post('/editSecUSer/:id',authPrimary,primaryIsBlocked,editSecUSer)
router.get('/fetchGodownsAndPriceLevels/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,fetchGodownsAndPriceLevels)
router.post('/addSecondaryConfigurations/:cmp_id/:userId',authPrimary,primaryIsBlocked,companyAuthentication,addSecondaryConfigurations)
router.get("/fetchConfigurationCurrentNumber/:orgId/:_id",authPrimary,primaryIsBlocked,fetchConfigurationCurrentNumber)


export default router;

