const express = require("express");
const app = express();
const fs = require("fs");
const Joi = require("joi");

//const students = require("./students.json");

app.use(express.json());
// For read students data
const studentsData = fs.readFileSync("./students.json");
const students = JSON.parse(studentsData);

// Endpoint to display all students
app.get("/students", (req, res) => {
  res.send(students.map((student) => student["nom "]));
});

// Endpoint to add new student
app.post("/students", (req, res) => {
  const schema = Joi.object({
    nom: Joi.string().required(),
    classe: Joi.string().required(),
    modules: Joi.array().items(
      Joi.object({
        module: Joi.string().required(),
        note: Joi.number().integer().min(0).max(20).required(),
      })
    ),
  });

  const result = schema.validate(req.body);

  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
    
  }

  const newStudent = req.body;
  newStudent.moyenne = calculateAverage(newStudent.modules);
  students.push(newStudent);
  saveStudentsData(students);

  res.send(newStudent);
});

// Endpoint to display student by name
app.get("/students/:nom", 
(req, res) => {
  const student = students.find ( (s) => s["nom "] === req.params.nom );

  if (!student) {
    res.status(404).send("student not found");
    return;
  }

  res.send(student);
});
// Endpoint for modify students data
app.put('/students/:nom', function(req, res) {
  const student = students.find(s => s.id === req.params.id);
  if (student) {
    student["nom" ]= req.body.nom || student.nom;
    student.classe = req.body.classe || student.classe;
    student.modules = req.body.modules || student.modules;
    student.moyenne = req.body.moyenne || student.moyenne;
    // Save the modified data here
    res.send(student);
  } else {
    res.status(404).send({ message: 'Student not found' });
  }
});

// Endpoint for delete student
app.delete("/students/:nom", (req, res) => {

const studentIndex = students.findIndex((s) => s.nom === req.params.nom);

  if (studentIndex >= 0) {
    let delstu =   students.splice(studentIndex, 1);
    saveStudentsData(students);

    res.send("student deleted");  
  
  }
  else {
    return res.status(404).send("student not found");
     
   }
 
});

// Endpoint to display the average of all students
app.get("/students/:nom/moyenne", (req, res) => {
  const totalModules = students.reduce((acc, student) => {
    return acc + student["modules"].length;
  }, 0);

  const totalNotes = students.reduce((acc, student) => {
    return (
      acc +
      student["modules"].reduce((acc, module) => {
        return acc + module["note"];
      }, 0)
    );
  }, 0);

  const moyenne = totalNotes / totalModules;

  res.send({ moyenne });
});

// Endpoint to display best and worst note
app.get("/students/best-worst/moy", (req, res) => {
  const bestWorstNotes = students.map((student) => {
    const bestNote = Math.max(...student.modules.map((m) => m["note"]));
    const worstNote = Math.min(...student.modules.map((m) => m["note"]));
    return {
      nom: student.nom,
      meilleur: bestNote,
      pire: worstNote,
    };
  });

  res.send(bestWorstNotes);
});

function calculateAverage(modules) {
  const totalNotes = modules.reduce((acc, module) => {
    return acc + module["note"];
  }, 0);

  return totalNotes / modules.length;
}

function saveStudentsData(data) {
  fs.writeFileSync("./students.json", JSON.stringify(data));
}

const port = process.env.PORT || 3000;
app.listen(3005, () => {
  console.log("app work");
});