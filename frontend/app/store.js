import { configureStore } from '@reduxjs/toolkit'
import tallyDataReducer from '../slices/tallyDataSlice'
import setSelectedOrganizationReducer from '../slices/PrimarySelectedOrgSlice'
import secSelectedOrgReducer from '../slices/secSelectedOrgSlice'
import settlementDataReducer from '../slices/settlementDataSlice'
import prSettlementDataReducer from '../slices/prSettlementDataSlice'
import adminDataReducer from '../slices/adminData'

export const store = configureStore({
    reducer: {
        tallyData:tallyDataReducer,
        setSelectedOrganization:setSelectedOrganizationReducer,
        secSelectedOrganization:secSelectedOrgReducer,
        settlementData:settlementDataReducer,
        prSettlementData:prSettlementDataReducer,
        adminData:adminDataReducer
        

    },
  })