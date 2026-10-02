const API_URL = "/api/tasks";


// ========================================
// DOM
// ========================================

const taskList = document.getElementById("taskList");

const emptyMessage =
    document.getElementById("emptyMessage");

const statusFilter =
    document.getElementById("statusFilter");

const taskModal =
    document.getElementById("taskModal");

const taskForm =
    document.getElementById("taskForm");

const modalTitle =
    document.getElementById("modalTitle");

const taskId =
    document.getElementById("taskId");

const titleInput =
    document.getElementById("title");

const categoryInput =
    document.getElementById("category");

const statusInput =
    document.getElementById("status");

const deadlineInput =
    document.getElementById("deadline");

const descriptionInput =
    document.getElementById("description");


// ========================================
// Load Tasks
// GET /api/tasks
// ========================================

async function loadTasks() {

    try {

        const status = statusFilter.value;

        let url = API_URL;

        if (status) {
            url += `?status=${encodeURIComponent(status)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("ไม่สามารถโหลดข้อมูลได้");
        }

        const tasks = await response.json();

        renderTasks(tasks);

    } catch (error) {

        console.error(error);

        showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล");

    }
}


// ========================================
// Render Tasks
// ========================================

function renderTasks(tasks) {

    taskList.innerHTML = "";

    updateDashboard(tasks);

    if (tasks.length === 0) {

        emptyMessage.classList.remove("hidden");

        return;

    }

    emptyMessage.classList.add("hidden");


    tasks.forEach(task => {

        const card =
            document.createElement("div");

        card.className = "task-card";


        card.innerHTML = `

            <div>

                <span class="category">
                    ${escapeHTML(task.category)}
                </span>

                <span class="status ${task.status}">
                    ${getStatusText(task.status)}
                </span>

            </div>


            <h3>
                ${escapeHTML(task.title)}
            </h3>


            <p class="task-description">
                ${escapeHTML(
                    task.description || "ไม่มีรายละเอียด"
                )}
            </p>


            <div class="deadline">
                📅 ${formatDate(task.deadline)}
            </div>


            <div class="card-actions">

                <button
                    class="btn btn-secondary"
                    onclick="openEditModal(${task.id})"
                >
                    แก้ไข
                </button>

                <button
                    class="btn btn-danger"
                    onclick="deleteTask(${task.id})"
                >
                    ลบ
                </button>

            </div>

        `;

        taskList.appendChild(card);

    });

}


// ========================================
// Dashboard
// ========================================

async function updateDashboard() {

    try {

        const response =
            await fetch(API_URL);

        const tasks =
            await response.json();

        document.getElementById(
            "totalTasks"
        ).textContent = tasks.length;


        document.getElementById(
            "progressTasks"
        ).textContent =
            tasks.filter(
                task => task.status === "in-progress"
            ).length;


        document.getElementById(
            "completedTasks"
        ).textContent =
            tasks.filter(
                task => task.status === "completed"
            ).length;

    } catch (error) {

        console.error(error);

    }
}


// ========================================
// Open Add Modal
// ========================================

document
    .getElementById("openAddBtn")
    .addEventListener("click", () => {

        openAddModal();

    });


function openAddModal() {

    modalTitle.textContent = "เพิ่มงานใหม่";

    taskForm.reset();

    taskId.value = "";

    taskModal.classList.remove("hidden");

}


// ========================================
// Close Modal
// ========================================

function closeModal() {

    taskModal.classList.add("hidden");

}

document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeModal);

document
    .getElementById("cancelBtn")
    .addEventListener("click", closeModal);


// ========================================
// POST / PATCH
// ========================================

taskForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const data = {

            title: titleInput.value,

            category: categoryInput.value,

            status: statusInput.value,

            deadline: deadlineInput.value,

            description: descriptionInput.value

        };


        try {

            // EDIT
            if (taskId.value) {

                const response =
                    await fetch(
                        `${API_URL}/${taskId.value}`,
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(data)
                        }
                    );


                if (!response.ok) {

                    const error =
                        await response.json();

                    throw new Error(error.message);

                }


                showToast("แก้ไขงานสำเร็จ");

            }

            // ADD
            else {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(data)
                        }
                    );


                if (!response.ok) {

                    const error =
                        await response.json();

                    throw new Error(error.message);

                }


                showToast("เพิ่มงานสำเร็จ");

            }


            closeModal();

            await loadTasks();

        } catch (error) {

            console.error(error);

            showToast(error.message);

        }

    }
);


// ========================================
// GET /api/tasks/:id
// เปิดข้อมูลเพื่อแก้ไข
// ========================================

async function openEditModal(id) {

    try {

        const response =
            await fetch(`${API_URL}/${id}`);


        if (!response.ok) {

            throw new Error(
                "ไม่พบงานที่ต้องการแก้ไข"
            );

        }


        const task =
            await response.json();


        modalTitle.textContent =
            "แก้ไขงาน";


        taskId.value = task.id;

        titleInput.value = task.title;

        categoryInput.value =
            task.category;

        statusInput.value =
            task.status;

        deadlineInput.value =
            task.deadline;

        descriptionInput.value =
            task.description || "";


        taskModal.classList.remove(
            "hidden"
        );


    } catch (error) {

        showToast(error.message);

    }

}


// ========================================
// DELETE
// ========================================

async function deleteTask(id) {

    const confirmed =
        confirm(
            "คุณต้องการลบงานนี้ใช่หรือไม่?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const error =
                await response.json();

            throw new Error(error.message);

        }


        showToast("ลบงานสำเร็จ");

        await loadTasks();


    } catch (error) {

        console.error(error);

        showToast(error.message);

    }

}


// ========================================
// Filter
// ========================================

statusFilter.addEventListener(
    "change",
    loadTasks
);


// ========================================
// Helper
// ========================================

function getStatusText(status) {

    const statusText = {

        "todo": "ยังไม่เริ่ม",

        "in-progress": "กำลังทำ",

        "completed": "เสร็จแล้ว"

    };

    return statusText[status] || status;

}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "th-TH",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// ========================================
// Start
// ========================================

loadTasks();