import mongoose from "mongoose"
import purchaseModel from "../models/purchaseModel.js";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import creditNoteModel from "../models/creditNoteModel.js";
export const getstockDetails = async (req, res) => {
    const { start, end } = req.query
    const { cmp_id } = req.params
    const companyObjectId = new mongoose.Types.ObjectId(cmp_id)
    let dateFilter = {};
    if (start && end) {
        const startDate = parseISO(start);
        const endDate = parseISO(end);
        dateFilter = {
            date: {
                $gte: startOfDay(startDate),
                $lte: endOfDay(endDate),
            },
        };
    }
    const matchCriteria = {
        ...dateFilter,
        cmp_id: companyObjectId,
    };
    const purchase = await purchaseModel.find( matchCriteria)
const creditnote=await creditNoteModel.find(matchCriteria)
const mergedinward=[...purchase,...creditnote]
// console.log(mergedinward) 
// console.log("puuuuuuuu",pu)
    // console.log("pru", purchase)

}