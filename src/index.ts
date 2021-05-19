import * as functions from "firebase-functions";
import * as express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import * as cors from 'cors';


const app = express();
app.use(express.json());

app.use(cors({ origin: true }))

const uri = 'mongodb+srv://user:pass.word@cluster0.2gpmf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const Client = () => (
	new MongoClient(uri, {
  	useNewUrlParser: true,
  	useUnifiedTopology: true,
}));

app.post('/news', async (req, res) => {
	const client = Client();
	try {
		await client.connect();

		const database = client.db('database');
		const collection = database.collection('news');

		const baseURL = 'https://casper-chatbot-maxq.web.app';
		const id = new ObjectId();
		const link = `${baseURL}/news/${id}`;

		const data = { ...req.body, _id: id, link };

		await collection.insertOne(data);

		res.send({ message: 'Created', id, link });
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: 'Error' });
	} finally {
		await client.close();
	}
});

app.get('/news/:id', async (req, res) => {
	const client = Client();
	try {
		await client.connect();

		const database = client.db('database');
		const collection = database.collection('news');

		const id = new ObjectId(req.params.id);
		const result = await collection.findOne({ '_id': id });
		
		res.send({ message: 'Retrived', data: result });
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: 'Error' });
	} finally {
		await client.close();
	}
});

app.get('/news', async (req, res) => {
	const client = Client();
	try {
		await client.connect();

		const database = client.db('database');
		const collection = database.collection('news');

		const result = await collection.find({});

		const data: any[] = [];
		await result.forEach(doc => data.push(doc));
		await result.close();

		res.send({ message: 'Retrived', data });
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: 'Error' });
	} finally {
		await client.close();
	}
});

app.delete('/news', async (req, res) => {
	const client = Client();
	try {
		await client.connect();

		const database = client.db('database');
		const collection = database.collection('news');
		const id = new ObjectId(req.body.id);

		await collection.deleteOne({ '_id': id });

		res.send({ message: 'Deleted' });
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: 'Error' });
	} finally {
		await client.close();
	}
});

interface Update {
	'$set': {
		[key: string]: string;
	}
}

app.put('/news', async (req, res) => {
	const client = Client();
	try {
		await client.connect();

		const database = client.db('database');
		const collection = database.collection('news');
		const id = new ObjectId(req.body.id);

		const update: Update = {
			'$set': {},
		}

		for (const field in req.body) {
			if (field !== '_id') {
				update['$set'][field] = req.body[field];
			}
		}

		await collection.updateOne({ '_id': id }, update);
		res.send({message: 'Updated'});
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: 'Error' });
	} finally {
		await client.close();
	}
});

export const api = functions.https.onRequest(app);
