const express = require("express");
const cors = require("cors");

const { v4: uuidv4, validate: uuidValidate } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function ProjectIndex(id) {
  projectIndex = repositories.findIndex(project => project.id === id);

  return projectIndex;
};

function ValidateProject(request, response, next) {
  const { id } = request.params;

  projectIndex = repositories.findIndex(project => project.id === id);

  if(projectIndex < 0) {
    console.log("\nError: project not found");
    return response.status(400).json({ error: 'Invalid project ID.'});
  }

  return next();
};

function ValidateProjectId(request, response, next) {
  const { id } = request.params;

  if (!uuidValidate(id)) {
    return response.status(400).json({ error: 'Invalid project ID' });
  }

  return next();
};

function LogRequest(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
};

app.use(LogRequest);
app.use('/repositories/:id', [ValidateProject, ValidateProjectId]);



app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  
  const project = { id: uuidv4(), title, url, techs, likes: 0 }

  repositories.push(project);

  console.log("\nThe project was successfully added!");
  return response.json(project);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const index = ProjectIndex(id);

  const project = { 
    id,
    title,
    url,
    techs,
    likes: repositories[index].likes
  }

  repositories[index] = project;

  console.log("\nProject updated sucessfully!");
  return response.json(repositories[index]);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const index = ProjectIndex(id);

  repositories.splice(index, 1);

  console.log("\nProject deleted sucessfully!");
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const index = ProjectIndex(id);
  
  repositories[index].likes++;

  console.log("\nProject receive a like!");
  return response.json(repositories[index]);
});

module.exports = app;
