const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "../data/tasks.json");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// อ่านข้อมูลจาก JSON
function readTasks() {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
}

// บันทึกข้อมูลลง JSON
function saveTasks(tasks) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(tasks, null, 4),
        "utf8"
    );
}

// ========================================
// GET /api/tasks
// ดึงรายการทั้งหมด + filter ด้วย status
// ========================================

app.get("/api/tasks", (req, res) => {
    const tasks = readTasks();
    const { status } = req.query;

    if (status) {
        const filteredTasks = tasks.filter(
            task => task.status === status
        );

        return res.json(filteredTasks);
    }

    res.json(tasks);
});

// ========================================
// GET /api/tasks/:id
// ========================================

app.get("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const id = Number(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json(task);
});

// ========================================
// POST /api/tasks
// ========================================

app.post("/api/tasks", (req, res) => {
    const tasks = readTasks();

    const {
        title,
        category,
        status,
        deadline,
        description
    } = req.body;

    // Validation
    if (!title || !category || !status || !deadline) {
        return res.status(400).json({
            message: "กรุณากรอก title, category, status และ deadline"
        });
    }

    const newTask = {
        id: tasks.length > 0
            ? Math.max(...tasks.map(task => task.id)) + 1
            : 1,

        title: title.trim(),
        category,
        status,
        deadline,
        description: description
            ? description.trim()
            : ""
    };

    tasks.push(newTask);
    saveTasks(tasks);

    res.status(201).json(newTask);
});

// ========================================
// PATCH /api/tasks/:id
// ========================================

app.patch("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const id = Number(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const {
        title,
        category,
        status,
        deadline,
        description
    } = req.body;

    if (title !== undefined) {
        if (!title.trim()) {
            return res.status(400).json({
                message: "Title cannot be empty"
            });
        }

        task.title = title.trim();
    }

    if (category !== undefined) {
        task.category = category;
    }

    if (status !== undefined) {
        task.status = status;
    }

    if (deadline !== undefined) {
        task.deadline = deadline;
    }

    if (description !== undefined) {
        task.description = description.trim();
    }

    saveTasks(tasks);

    res.json(task);
});

// ========================================
// DELETE /api/tasks/:id
// ========================================

app.delete("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const id = Number(req.params.id);

    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    tasks.splice(index, 1);
    saveTasks(tasks);

    res.status(204).send();
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});