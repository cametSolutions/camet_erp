export const getUserFriendlyMessage = (error, item) => {
    if (error.includes("Missing bill_no")) {
        return "bill_no is missing"
    }
    if (error.includes("Missing bill_amount")) {
        return "Missing bill_amount"
    }
    if (error.includes("Missing bill_pending_amt")) {
        return "Missing bill_pending_amt"
    }
    if (error.includes("Invalid Primary_user_id")) {
        return `Primary_user_id is not valid for bill no:${item.bill_no || "N/A"}`
    }
    if (error.includes("Missing Primary_user_id")) {
        return `Primary_user_id is missing for bill no:${item.bill_no || "N/A"}`
    }
    if (error.includes("Invalid cmp_id")) {
        return `cmp_id is invalid for bill no:${item.bill_no || "N/A"}`
    }
    if (error.includes("Missing cmp_id")) {
        return `cmp_id is missing for bill no:${item.bill_no || "N/A"}`
    }
    if (error.includes("Missing party_id")) {
        return `party_id is missing for bill no:${item.bill_no || "N/A"}`
    }
    if (error.includes("Invalid party_id")) {
        return `party_id is not matching for bill no: ${item.bill_no || "N/A"}`;
    }
    if (error.includes("Missing accountGroup_id")) {
        return `accountGroup_id is missing for bill no:${item.bill_no || "N/A"}`
    }
    if (error.includes("Invalid accountGroup_id")) {
        return `accountGroup_id is not matching for bill no: ${item.bill_no || "N/A"}`;
    }
    if (error.includes("Invalid subGroup_id")) {
        return `Invalid subGroup_id is invalid for bill no: ${item.bill_no || "N/A"}`;
    }

    if (error.includes("party_name")) {
        return `party_name is missing for bill no:${item.bill_no || "N/A"}`
    }

    // Default fallback
    return `Something went wrong for bill no: ${item.bill_no || "N/A"}`;
}
