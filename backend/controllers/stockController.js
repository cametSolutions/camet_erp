import mongoose from "mongoose"
import purchaseModel from "../models/purchaseModel.js";
import productModel from "../models/productModel.js";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import creditNoteModel from "../models/creditNoteModel.js";
import salesModel from "../models/salesModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import debitNoteModel from "../models/debitNoteModel.js";
export const getstockDetails = async (req, res) => {
    const { start, tenureStart, tenureEnd } = req.query

    const a = parseISO(start)
    const b = startOfDay(a)

    const { cmp_id } = req.params
    const companyObjectId = new mongoose.Types.ObjectId(cmp_id)
    let dateFilter = {};
    if (tenureStart && tenureEnd) {
        const startDate = parseISO(tenureStart);
        const endDate = parseISO(tenureEnd);
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

    const [product, purchase, creditNote, sales, vansale, debit] = await Promise.all([
        productModel.find({ cmp_id: companyObjectId }).populate({
            path: 'GodownList.godown',
            select: 'godown'
        }).populate({ path: 'category', select: 'category' }).populate({ path: 'brand', select: 'brand' }),
        purchaseModel.find(matchCriteria).populate({ path: 'items.brand', select: 'brand' }).populate({ path: 'items.category', select: 'category' }),
        creditNoteModel.find(matchCriteria).populate({ path: 'items.brand', select: 'brand' }).populate({ path: 'items.category', select: 'category' }),
        salesModel.find(matchCriteria).populate({ path: 'items.brand', select: 'brand' }).populate({ path: 'items.category', select: 'category' }),
        vanSaleModel.find(matchCriteria).populate({ path: 'items.brand', select: 'brand' }).populate({ path: 'items.category', select: 'category' }),
        debitNoteModel.find(matchCriteria).populate({ path: 'items.brand', select: 'brand' }).populate({ path: 'items.category', select: 'category' })])
    const alldocs = [...purchase.map(d => ({ ...d.toObject(), voucherType: 'purchase' })),
    ...creditNote.map(d => ({ ...d.toObject(), voucherType: 'creditNote' })),
    ...sales.map(d => ({ ...d.toObject(), voucherType: 'sales' })),
    ...vansale.map(d => ({ ...d.toObject(), voucherType: 'sales' })),
    ...debit.map(d => ({ ...d.toObject(), voucherType: 'debitNote' }))]

    const itemStats = {}
    for (const doc of alldocs) {
        const type = doc.voucherType


        for (const item of doc.items) {

            for (const it of item.GodownList) {
                if (it.added) {
                    const { product_name } = item
                    const { count } = it
                    if (doc.date >= b) {

                        if (!itemStats[product_name]) {
                            itemStats[product_name] = {
                                itemName: product_name,
                                brand: item?.brand?.brand,
                                category: item?.category?.category,
                                inward: { quantity: 0, amount: 0 },
                                outward: { quantity: 0, amount: 0 },
                                opening: { quantity: 0, rate: 0, amount: 0 },
                                closing: { quantity: 0, amount: 0 },
                                inwardsome: { quantity: 0, amount: 0 },
                                outwardsome: { quantity: 0, amount: 0 }
                            }
                        }
                        if (type === 'purchase' || type === 'creditNote') {
                            itemStats[product_name].inward.quantity += count;
                            itemStats[product_name].inward.amount += it.individualTotal;
                        }

                        if (type === 'sales' || type === 'debitNote') {
                            itemStats[product_name].outward.quantity += count;
                            itemStats[product_name].outward.amount += it.individualTotal;
                        }
                    } else {
                        if (!itemStats[product_name]) {
                            itemStats[product_name] = {
                                itemName: product_name,
                                brand: item?.brand?.brand,
                                category: item?.category?.category,
                                inward: { quantity: 0, amount: 0 },
                                outward: { quantity: 0, amount: 0 },
                                opening: { quantity: 0, rate: 0, amount: 0 },
                                closing: { quantity: 0, rate: 0, amount: 0 },
                                inwardsome: { quantity: 0, amount: 0 },
                                outwardsome: { quantity: 0, amount: 0 },

                            }
                        }
                        if (type === 'purchase' || type === 'creditNote') {
                            itemStats[product_name].inwardsome.quantity += count;
                            itemStats[product_name].inwardsome.amount += it.individualTotal;
                        }

                        if (type === 'sales' || type === 'debitNote') {
                            itemStats[product_name].outwardsome.quantity += count;
                            itemStats[product_name].outwardsome.amount += it.individualTotal;
                        }
                    }
                    //
                }
            }


        }


    }
    const round2 = (n) => Number(n.toFixed(2))
    // compute rates & closing
    for (const stat of Object.values(itemStats)) {
        stat.inward.rate = stat.inward.quantity
            ? round2(stat.inward.amount / stat.inward.quantity)
            : 0;

        stat.outward.rate = stat.outward.quantity
            ? round2(stat.outward.amount / stat.outward.quantity)
            : 0;


        stat.inward.amount = round2(stat.inward.amount);
        stat.outward.amount = round2(stat.outward.amount);

    }

    const individualArray = Object.values(itemStats);

    const mapped = {};

    for (const doc of alldocs) {
        const type = doc.voucherType
        for (const item of doc.items) {
            for (const it of item.GodownList) {
                if (it.added) {
                    const { count } = it
                    const key = `${item.product_name}|${it.batch || "Primary Batch"}|${it?.godown}`;

                    if (doc.date >= b) {
                        if (!mapped[key]) {
                            mapped[key] = {
                                itemName: item.product_name,
                                batch: it?.batch || "Pimary Batch",
                                godown: it?.godown,
                                category: it?.category?.category,
                                brand: it?.brand?.brand,

                                inward: { quantity: 0, amount: 0 },
                                outward: { quantity: 0, amount: 0 },
                                inwardsome: { quantity: 0, amount: 0, rate: 0 },
                                outwardsome: { quantity: 0, amount: 0, rate: 0 },
                                opening: { quantity: 0, rate: 0, amount: 0 },
                                closing: { quantity: 0, rate: 0, amount: 0 }
                            };

                        }

                        if (type === 'purchase' || type === 'creditNote') {
                            mapped[key].inward.quantity += count;
                            mapped[key].inward.amount += it.individualTotal;
                        }

                        if (type === 'sales' || type === 'debitNote') {
                            mapped[key].outward.quantity += count;
                            mapped[key].outward.amount += it.individualTotal;
                        }


                    } else {
                        if (!mapped[key]) {
                            mapped[key] = {
                                itemName: item.product_name,
                                batch: it?.batch || "Primary Batch",
                                godown: it?.godown,
                                category: it?.category?.category,
                                brand: it?.brand?.brand,
                                inward: { quantity: 0, amount: 0 },
                                outward: { quantity: 0, amount: 0 },
                                inwardsome: { quantity: 0, rate: 0, amount: 0 },
                                outwardsome: { quantity: 0, rate: 0, amount: 0 },
                                opening: { quantity: 0, rate: 0, amount: 0 },
                                closing: { quantity: 0, rate: 0, amount: 0 }
                            };
                        }
                        if (type === 'purchase' || type === 'creditNote') {
                            mapped[key].inwardsome.quantity += count;
                            mapped[key].inwardsome.amount += it.individualTotal;
                        }

                        if (type === 'sales' || type === 'debitNote') {
                            mapped[key].outwardsome.quantity += count;
                            mapped[key].outwardsome.amount += it.individualTotal;
                        }


                    }

                }

            }

        }
    }
    for (const stat of Object.values(mapped)) {
        stat.inward.rate = stat.inward.quantity
            ? round2(stat.inward.amount / stat.inward.quantity)
            : 0;

        stat.outward.rate = stat.outward.quantity
            ? round2(stat.outward.amount / stat.outward.quantity)
            : 0;

        stat.inward.amount = round2(stat.inward.amount);
        stat.outward.amount = round2(stat.outward.amount);

    }
    const mappedArray = Object.values(mapped);

    product.forEach((it) => {
        let target = individualArray.find(ie => ie.itemName === it.product_name)
        if (!target) {
            target = {
                itemName: it.product_name,
                brand: it?.brand?.brand || null,
                category: it?.category?.category || null,
                inward: { quantity: 0, amount: 0, rate: 0 },
                outward: { quantity: 0, amount: 0, rate: 0 },
                opening: { quantity: 0, rate: 0, amount: 0 },
                closing: { quantity: 0, amount: 0, rate: 0 },
                inwardsome: { quantity: 0, amount: 0 },
                outwardsome: { quantity: 0, amount: 0 },
            };
            individualArray.push(target);
        }

        // check if any godownItem has purchase_cost
        const hasPurchaseCostInGodowns = it.GodownList.some(
            godownItem => godownItem.purchase_cost != null
        );

        if (hasPurchaseCostInGodowns) {
            // sum up purchase_cost from each godown
            const result = it.GodownList.reduce((acc, godownItem) => {
                const cost = godownItem?.purchase_cost ?? it.purchase_cost
                const open = godownItem?.opening ?? 0
                acc.sum += cost
                acc.individualOpening += open
                return acc


            }, { sum: 0, individualOpening: 0 });


            target.opening.quantity = (target.inwardsome.quantity - target.outwardsome.quantity) + result.individualOpening
            target.opening.rate = result.sum
            target.opening.amount = target.opening.rate * target.opening.quantity

            target.closing.quantity = (target.inward.quantity - target.outward.quantity) + target.opening.quantity
            target.closing.rate = target.opening.rate
            target.closing.amount = target.closing.quantity * target.closing.rate

        } else {
            const result = it.GodownList.reduce((acc, godownItem) => {
                const cost = godownItem?.purchase_cost ?? it.purchase_cost
                const open = godownItem?.opening ?? 0
                acc.sum += cost
                acc.individualOpening += open
                return acc


            }, { sum: 0, individualOpening: 0 })
            // fall back to old logic


            target.opening.quantity = (target.inwardsome.quantity - target.outwardsome.quantity) + result.individualOpening
            target.opening.rate = result.sum
            target.opening.amount = target.opening.rate * target.opening.quantity

            target.closing.quantity = (target.inward.quantity - target.outward.quantity) + target.opening.quantity
            target.closing.rate = target.opening.rate

            target.closing.amount = target.closing.quantity * target.closing.rate

        }

        it.GodownList.forEach((item) => {

            const keyToFind = Object.keys(mapped).find(k => k === `${it.product_name}|${item?.batch || "Primary Batch"}|${item?.godown?.godown}`)
            let individuaTtarget = mapped[keyToFind]
            if (!individuaTtarget) {
                individuaTtarget = {
                    itemName: it.product_name,
                    batch: item?.batch || "Primary Batch",
                    category: item?.category?.category,
                    brand: item?.brand?.brand,
                    godown: item?.godown?.godown,
                    inward: { quantity: 0, amount: 0, rate: 0 },
                    outward: { quantity: 0, amount: 0, rate: 0 },
                    opening: { quantity: 0, rate: 0, amount: 0 },
                    closing: { quantity: 0, amount: 0, rate: 0 },
                    inwardsome: { quantity: 0, amount: 0 },
                    outwardsome: { quantity: 0, amount: 0 },
                };
                mappedArray.push(individuaTtarget);
            }
            individuaTtarget.opening.quantity = (individuaTtarget.inwardsome.quantity - individuaTtarget.outwardsome.quantity) + (item?.opening ?? 0)

            individuaTtarget.opening.rate = item?.purchase_cost ?? it.purchase_cost
            individuaTtarget.opening.amount = individuaTtarget.opening.rate * individuaTtarget.opening.quantity


            individuaTtarget.closing.quantity = (individuaTtarget.inward.quantity - individuaTtarget.outward.quantity) + individuaTtarget.opening.quantity
            individuaTtarget.closing.rate = target.opening.rate
            individuaTtarget.closing.amount = individuaTtarget.closing.rate * individuaTtarget.closing.quantity

        })


    });

    const result = {
        individualArray,

        mappedArray

    };

    if (result) {
        return res.status(200).json({ message: "stok details found", result })
    } else {
        return res.status(400).json({ message: "stock details not found", result: [] })
    }


}