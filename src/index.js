///CRUD table backend
///based on https://codesandbox.io/s/fastify-005-cors-8ecmk

const fastify = require("fastify");
const fastifyCors = require("fastify-cors");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.PGSTRING
});

const server = fastify({ logger: true });

server.register(fastifyCors, {});

server.get("/", async (request, reply) => {
  const sql = "SELECT * FROM peeps";
  const result = await client.query(sql);
  reply.send(result.rows);
});

server.post("/", async (request, reply) => {
  const sql = "INSERT INTO peeps (name, username) VALUES ($1, $2);";
  const values = [request.body.name, request.body.username];
  const result = await client.query(sql, values);
  reply.send(result);
});

server.delete("/:id", async (request, reply) => {
  const sql = "DELETE FROM peeps WHERE id = $1";
  const values = [request.params.id];
  const result = await client.query(sql, values);
  reply.send(result);
});

(async () => {
  try {
    await client.connect();

    await client.query(`
    CREATE TABLE IF NOT EXISTS peeps (
      id serial PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL
    );
    `);

    await server.listen(8080);

    console.info("App started correctly");
  } catch (err) {
    console.error(`Boot Error: ${err.message}`);
  }
})();
