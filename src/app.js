const http = require('http');
const Todo = require('./models/Todo');
const Io = require('./utils/Io');
const Todos = new Io('./db/todo.json');
const bodyParser = require('./utils/bodyParser');


http
	.createServer(async (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		if (req.url.match(/\/todo\/\w+/) && req.method === 'GET') {
			try {
				const reqId = req.url.split('/')[2];

				const todos = await Todos.read();

				const findTodo = todos.find((t) => t.id == reqId);
        //   response 
				const resp = {
					status: 'Ok',
					data: findTodo || "Bunday id li todo yoq yoki o'chirilgan",
				};
				res.writeHead(200);
				res.end(JSON.stringify(resp));
			} catch (error) {
				res.writeHead(500);
				res.end(JSON.stringify({ message: 'Internal server error' }));
			}
		} else if (req.url === '/todo' && req.method === 'GET') {
			try {
				const todos = await Todos.read();
 //   response 
				const resp = {
					status: 'Ok',
					data: todos || ' todolar yoq',
				};
				res.writeHead(200);
				res.end(JSON.stringify(resp));
			} catch (error) {
				res.writeHead(500);
				res.end(JSON.stringify({ message: 'Internal server error' }));
			}
		} else if (req.url === '/todo' && req.method === 'POST') {
			try {
				const { title, text } = await bodyParser(req);

				if (title && text) {
					const d = new Date();
					const todos = await Todos.read();
					const id = (todos[todos.length - 1]?.id || 0) + 1;

					const newTodo = new Todo(id, title, text, d);
					const data = todos.length ? [...todos, newTodo] : [newTodo];

        //    response
					const resp = {
						message: 'Created',
						data: newTodo,
					};
					res.writeHead(201);
					res.end(JSON.stringify(resp));
					Todos.write(data);
				} else if(!title) {
					// title yoki text bolamasa
					res.end(
						JSON.stringify({ message: 'Iltimos title kiriting' })
					);
				}else if(!text) {
					// title yoki text bolamasa
					res.end(
						JSON.stringify({ message: 'Iltimos text kiriting' })
					);
				}else{
					res.end(
						JSON.stringify({ message: 'Iltimos text va title  kiriting' })
					);
				}
			} catch (error) {
				res.writeHead(500);
				const resp = {
					message: 'Internal Server Eror',
					error: error,
				};
				req.end(JSON.stringify(resp));
			}
		} else if (req.url.match(/\/todo\/\w+/) && req.method === 'PUT') {
			try {
				const reqId = req.url.split('/')[2];
				const todos = await Todos.read();
				const { title, text, iscompleted } = await bodyParser(req);

				const findInx = todos.findIndex((t) => t.id == reqId);

				todos[findInx].id = todos[findInx].id;
				todos[findInx].title = title || todos[findInx].title;
				todos[findInx].text = text || todos[findInx].text;
				todos[findInx].iscompleted = iscompleted || todos[findInx].iscompleted;

				//  response Server
				Todos.write(todos);
				res.writeHead(200);
				res.end(JSON.stringify({ message: 'Changed' }));
			} catch (error) {
				res.writeHead(500);
				res.end(JSON.stringify({ message: 'Internal server error' }));
			}
		} else if (req.url.match(/\/todo\/\w+/) && req.method === 'DELETE') {
			try {
				const reqId = req.url.split('/')[2];
				const todos = await Todos.read();

				const filteredTodo = todos.filter((t) => t.id != reqId);

				//  response Server
				Todos.write(filteredTodo);
				res.writeHead(200);
				res.end(JSON.stringify({ status: 'Delited' }));
			} catch (error) {
				res.writeHead(500);
				res.end(JSON.stringify({ message: 'Internal server error' }));
			}
		}
	})
	.listen(2002, () => {
		console.log('Server Running on: 2002');
	});
