export const aggregateSummary = async (
  model,
  matchCriteria,
  numberField,
  type
) => {
console.log("moddl",model)
console.log("type",type)
console.log("matcingcre",matchCriteria)
  try {
    const results = await model.aggregate([{ $match: matchCriteria }]);

    // Add type to each result to identify its source if not already included in projection
    if (!results[0]?.sourceType) {
      return results.map((item) => ({
        ...item,
        sourceType: type,
      }));
    }

    return results;
  } catch (error) {
    console.error(`Error in aggregateSummary for ${type}:`, error.message);
    return [];
  }
};
