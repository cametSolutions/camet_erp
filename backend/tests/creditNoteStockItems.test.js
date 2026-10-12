import test from 'node:test';
import assert from 'node:assert/strict';
import { creditNoteStockItems } from '../helpers/creditNoteStockItems.js';
test('pricing variants add stock once with combined billed and actual quantities', () => {
 const items = [100, 80].map(rate => ({_id:'p1', totalCount:2, totalActualCount:4,
  hasGodownOrBatch:true, gdnEnabled:true, batchEnabled:true,
  GodownList:[{godownMongoDbId:'g1', batch:'A', count:2, actualCount:4, selectedPriceRate:rate, added:true}]}));
 const before=JSON.stringify(items), result=creditNoteStockItems(items);
 assert.equal(result.length,1); assert.equal(result[0].totalActualCount,8);
 assert.equal(result[0].GodownList.length,1);assert.equal(result[0].GodownList[0].actualCount,8);
 assert.equal(JSON.stringify(items),before);
});
test('different destinations remain separate and disabled rows do not affect stock', () => {
 const result=creditNoteStockItems([{_id:'p1',totalCount:3,gdnEnabled:true,batchEnabled:true,
 GodownList:[{godownMongoDbId:'g1',batch:'A',count:1},{godownMongoDbId:'g2',batch:'A',count:2},
 {godownMongoDbId:'g1',batch:'A',count:10,added:false}]}]);
 assert.equal(result[0].GodownList.length,2);assert.equal(result[0].GodownList[0].actualCount,1);
 assert.equal(result[0].totalActualCount,3);
});
