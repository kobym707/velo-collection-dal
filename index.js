module.exports = {
    helloNPM,
    upsertItem,
    removeItem,
    getItem,
    adminDBOptions:  {
        "suppressAuth": true,
        "suppressHooks": true
    }
}

import wixData from 'wix-data';

function projectObject(originalObject,newFieldsObject) {
    var newObject = JSON.parse(JSON.stringify(originalObject));
    Object.keys(newFieldsObject).forEach( fieldKey =>
        newObject[fieldKey] = newFieldsObject[fieldKey]
    );
    return newObject
}

export function helloNPM() {
    return 'hello from velo collection dal';
}


/**
 * Inserts or update an item to a collection.
 * @param {string} collectionName
 * @param {string} primaryKey 
 * @param {object} itemToUpsert If the primaryKey does not exist in the collection - the itemToUpsert is added to the collection. If the primaryKey exists - the fields that exist in the itemToUpsert are updated. Note: itemToUpsert must also contain the primaryKeyField
 * @param {object} options Use AppDAL.adminDBOptions to gain admin access
 * @returns {Promise<object>} The inserted/updated item
 */
 async function upsertItem(collectionName,primaryKey,itemToUpsert,options) {
    console.log(`[collections-dal:upsert: ${JSON.stringify(itemToUpsert)}`);
    if (!Object.keys(itemToUpsert).includes(primaryKey)) throw new Error(`[dal-instances:upsertItem] item to upsert ${itemToUpsert} does not contain primary key=${primaryKey}`);
        try {

        let itemsToUpsert = await wixData.query(collectionName).eq(primaryKey, itemToUpsert[primaryKey]).find(options);
        if (itemsToUpsert.items.length === 0) {
            let insertToInstances = await wixData.insert(collectionName, itemToUpsert, options);    
            console.log(`[collections-dal:upsert] succesfully inserted to collection=${collectionName} an item=${JSON.stringify(insertToInstances)}`);
            return insertToInstances;
        }
        else if (itemsToUpsert.items.length>0) {
            let newItem = projectObject(itemsToUpsert.items[0],itemToUpsert);
            console.log(`[collections-dal:upsert] new item to upsert ${JSON.stringify(newItem)}`);
            let updateItem = await wixData.update(collectionName, newItem, options);    
            console.log(`[collections-dal:upsert] succesfully updated collection=${collectionName} with item=${JSON.stringify(updateItem)}`);
            return updateItem;
        }
    } catch (error) {
        let errorMsg = `[collections-dal:upsert] error in upsert. collection=${collectionName}, error=${error}`;
        console.log(errorMsg);
        throw errorMsg;
    }
}

/**
 * Removes an item that matches the received key from a collection
 * @param {string} collectionName
 * @param {string} primaryKey The key by which to look for the item
 * @param {string} primaryKeyValue The key value to match the item that needs to be removed. 
 * @param {object} options Use AppDAL.adminDBOptions to gain admin access
 * @returns {Promise<object>} Fulfilled - The removed item. Rejected - The error that caused the rejection.
 */
 async function removeItem(collectionName,primaryKey,primaryKeyValue,options) {
    try {
        let itemsToDelete = await wixData.query(collectionName).eq(primaryKey, primaryKeyValue).find(options);
        const itemIdToDelete = itemsToDelete.items[0]._id;
        console.log(`[collections-dal:remove] about to remove from collection=${collectionName}, primaryKey=${primaryKey} primaryKeyValue=${primaryKeyValue} item id=${itemIdToDelete}`);
        let removeFromCollectionResult = await wixData.remove(collectionName, itemIdToDelete, options);
        console.log(`[collections-dal:remove] succesfully removed from collection=${collectionName},  itemResult= ${JSON.stringify(removeFromCollectionResult)}`);
        return removeFromCollectionResult;
    } catch (error) {
        let errorMsg = `[collections-dal:remove] removing from collection=${collectionName}, got error=${JSON.stringify(error)}`;
        console.log(errorMsg);
        throw errorMsg;
    }
}


 async function getItem(collectionName,primaryKey,primaryKeyValue,options) {

    try {
        let items = await wixData.query(collectionName).eq(primaryKey, primaryKeyValue).find(options);
        if (items.items.length>0) {
            return items.items[0];
        }
        else {
            let notFoundErrorMessage = `[collections-dal:getItem] unable to find item by primaryKey=${primaryKey}, primaryKeyValue=${primaryKeyValue}`;
            console.log(notFoundErrorMessage);
            throw notFoundErrorMessage;
        }
    } catch (error) {
        let generalErrorMessage = `[collections-dal:getItem] error getting item by primaryKey=${primaryKey}, primaryKeyValue=${primaryKeyValue}, error=${JSON.stringify(error)}`;
        console.log(generalErrorMessage);
        throw generalErrorMessage;
    }
}
