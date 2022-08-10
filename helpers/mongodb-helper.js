const { MongoClient, ObjectId } = require('mongodb');

let instance;

class MongoDB {
    static getInstance () {
        if (!instance) {
            instance = new MongoDB();
        }
        return instance;
    }

    async setupClient() {
        if (!this.client) {
            const url = process.env.MONGO_URL;
            this.client = new MongoClient(url);
            await this.client.connect();
        }
    }

    async create(doc, collection, db) {
        await this.setupClient();
        if (!db) db = process.env.MONGO_DBNAME;
        const res = await this.client.db(db).collection(collection).insertOne(doc);
        return { ...doc, _id: res.insertedId };
    }

    async read(id, collection, db) {
        await this.setupClient();
        if (!db) db = process.env.MONGO_DBNAME;
        const res = await this.client.db(db).collection(collection).findOne({_id: new ObjectId(id)});
        return res;
    }

    async query(criteria, collection, db) {
        await this.setupClient();
        if (!db) db = process.env.MONGO_DBNAME;
        const res = await this.client.db(db).collection(collection).find(criteria).toArray();
        return res;
    }

    async update(doc, collection, db) {
        await this.setupClient();
        if (!db) db = process.env.MONGO_DBNAME;
        const {_id, ...dataToUpdate} = doc;

        const res = await this.client.db(db).collection(collection)
            .updateOne({ _id: new ObjectId(_id) }, { $set: dataToUpdate });
        return res;
    }

    async delete(id, collection, db) {
        await this.setupClient();
        if (!db) db = process.env.MONGO_DBNAME;

        const res = await this.client.db(db).collection(collection)
            .deleteOne({_id: new ObjectId(id)});
        return res;
    }
}

module.exports = { MongoDB };