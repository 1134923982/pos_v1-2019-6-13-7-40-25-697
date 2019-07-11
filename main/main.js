'use strict';
// const fixture = require('../test/fixtures');
// const loadAllItems = fixture.loadAllItems;
// const loadPromotions = fixture.loadPromotions;


const decodeBarcodes = tags => {
    const decodedBarcodes = [];
    let amap = new Map();
    for (let i = 0; i < tags.length; i++) {
        let b = tags[i].split("-");
        if (b.length == 1) {
            if (amap.has(b[0])) {
                decodedBarcodes.forEach(item => {
                    if (item.barcode == b[0]) {
                        item.count++;
                    }
                });
            } else {
                amap.set(b[0]);
                let t = {barcode: b[0], count: 1};
                decodedBarcodes.push(t);
            }
        } else {
            if (amap.has(b[0])) {
                decodedBarcodes.forEach(item => {
                    if (item.barcode == b[0]) {
                        item.count = item.count + parseFloat(b[1]);
                    }
                });
            } else {
                amap.set(b[0]);
                let t = {barcode: b[0], count: parseFloat(b[1])};
                decodedBarcodes.push(t);
            }
        }
    }
    return decodedBarcodes;
}


const combineItems = itemList => {
    const allItems = loadAllItems();
    for (let i = 0; i < itemList.length; i++) {
        for (let j = 0; j < allItems.length; j++) {
            if (allItems[j].barcode == itemList[i].barcode) {
                itemList[i].name = allItems[j].name;
                itemList[i].price = allItems[j].price;
                itemList[i].unit = allItems[j].unit;
                break;
            }
        }
    }
    return itemList;
}

const decodeTags = tags=>{
    const decodedBarcodes = decodeBarcodes(tags);
    return combineItems(decodedBarcodes);
}


const calculatePreferentialPrices = items => {
    const promotiontions = loadPromotions();
    let preferentialPrice = 0;

    for (let i = 0; i < promotiontions.length; i++) {
        if (promotiontions[i].type == 'BUY_TWO_GET_ONE_FREE') {
            items.forEach(item => {
                if (promotiontions[i].barcodes.indexOf(item.barcode) >= 0) {
                    preferentialPrice = preferentialPrice +item.price * Math.floor(item.count / 3);
                    item.total = item.price * item.count - item.price * Math.floor(item.count / 3);
                }else {
                    item.total = item.price * item.count;
                }
            });
        }
    }
    console.log(items)

    return {items:items,preferentialPrice:preferentialPrice};
}

const calculateOriginalPrices = items => {
    let originalPrice=0;
    items.forEach(item=>{
        originalPrice+=item.price*item.count;
    })
    return originalPrice;
}

const calculatePrices = items => {
    const resultItems = calculatePreferentialPrices(items);
    const originPrice = calculateOriginalPrices(items);
    resultItems.originPrice = originPrice;

    return resultItems;
}

const renderFooter = (originPrice, preferentialPrice)=>{
    return `----------------------
总计：${(originPrice - preferentialPrice).toFixed(2)}(元)
节省：${preferentialPrice.toFixed(2)}(元)
**********************`;
}

const renderTitle = ()=>{
    return `***<没钱赚商店>收据***`;
}

const renderItems = items=>{
    console.log(items)
    let itemString = ``;
    items.forEach(item=>{
        console.log(item)
        console.log(item.total)
        itemString = `${itemString}
名称：${item.name}，数量：${item.count}${item.unit}，单价：${item.price.toFixed(2)}(元)，小计：${item.total.toFixed(2)}(元)`
    });
    return itemString;
}

const renderReceipt = receiptItems =>{
    return `${renderTitle()}${renderItems(receiptItems.items)}
${renderFooter(receiptItems.originPrice,receiptItems.preferentialPrice)}`
}



const printReceipt = tags =>{
    let items = decodeTags(tags);
    let receiptItems = calculatePrices(items);
    let receipt= renderReceipt(receiptItems);
    console.log(receipt);
}


